import { NextResponse } from "next/server";

import { sessionExtendSchema } from "@/lib/api/schemas";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

const notFound = () =>
  NextResponse.json({ error: "Active session not found" }, { status: 404 });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("dashboard:write");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = sessionExtendSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const session = await prisma.rentalSession.findFirst({
    where: { deviceId: id, completedAt: null },
  });
  if (!session || session.mode !== "timed") {
    return notFound();
  }
  if (session.stoppedAt) {
    return NextResponse.json(
      { error: "Session already stopped" },
      { status: 409 }
    );
  }

  const durationMinutes = (session.durationMinutes ?? 0) + parsed.data.extendMinutes;
  const endAt = new Date(session.startAt.getTime() + durationMinutes * 60_000);

  const updated = await prisma.rentalSession.update({
    where: { id: session.id },
    data: { durationMinutes, endAt },
  });

  return NextResponse.json({
    id: updated.id,
    durationMinutes: updated.durationMinutes ?? null,
    endAt: updated.endAt?.toISOString() ?? null,
  });
}
