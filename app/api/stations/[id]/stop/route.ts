import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const notFound = () =>
  NextResponse.json({ error: "Active session not found" }, { status: 404 });

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("dashboard:write");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const session = await prisma.rentalSession.findFirst({
    where: { deviceId: id, completedAt: null },
  });
  if (!session) {
    return notFound();
  }

  if (session.stoppedAt) {
    return NextResponse.json({
      id: session.id,
      stoppedAt: session.stoppedAt.toISOString(),
      endAt: session.endAt?.toISOString() ?? null,
    });
  }

  const now = new Date();
  const endAt =
    session.mode === "timed" && session.durationMinutes
      ? new Date(session.startAt.getTime() + session.durationMinutes * 60_000)
      : session.endAt;
  const stoppedAt = endAt ? new Date(Math.min(now.getTime(), endAt.getTime())) : now;

  const updated = await prisma.rentalSession.update({
    where: { id: session.id },
    data: {
      stoppedAt,
      endAt: endAt ?? undefined,
    },
  });

  return NextResponse.json({
    id: updated.id,
    stoppedAt: updated.stoppedAt?.toISOString() ?? null,
    endAt: updated.endAt?.toISOString() ?? null,
  });
}
