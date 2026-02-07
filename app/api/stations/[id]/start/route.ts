import { NextResponse } from "next/server";

import { sessionStartSchema } from "@/lib/api/schemas";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

const notFound = () =>
  NextResponse.json({ error: "Station not found" }, { status: 404 });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("dashboard:write");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const device = await prisma.device.findUnique({ where: { id } });
  if (!device) {
    return notFound();
  }

  if (device.status !== "Active") {
    return NextResponse.json(
      { error: "Station is not available" },
      { status: 409 }
    );
  }

  const existing = await prisma.rentalSession.findFirst({
    where: { deviceId: id, completedAt: null },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Session already running" },
      { status: 409 }
    );
  }

  const body = await request.json();
  const parsed = sessionStartSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  if (parsed.data.mode === "timed" && !parsed.data.durationMinutes) {
    return badRequest({ message: "durationMinutes is required" });
  }

  const startAt = new Date();
  const durationMinutes = parsed.data.durationMinutes ?? null;
  const endAt =
    parsed.data.mode === "timed" && durationMinutes
      ? new Date(startAt.getTime() + durationMinutes * 60_000)
      : null;

  const session = await prisma.rentalSession.create({
    data: {
      deviceId: id,
      employeeId: auth.employee?.id,
      mode: parsed.data.mode,
      ratePerHour: device.rate,
      startAt,
      durationMinutes: durationMinutes ?? undefined,
      endAt: endAt ?? undefined,
    },
  });

  return NextResponse.json({
    id: session.id,
    mode: session.mode,
    ratePerHour: session.ratePerHour,
    startAt: session.startAt.toISOString(),
    durationMinutes: session.durationMinutes ?? null,
    endAt: session.endAt?.toISOString() ?? null,
  });
}
