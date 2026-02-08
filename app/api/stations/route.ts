import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const toIso = (value: Date | null | undefined) =>
  value ? value.toISOString() : null;

export async function GET() {
  const auth = await requireAuth("dashboard:read");
  if (auth.response) {
    return auth.response;
  }

  const devices = await prisma.device.findMany({
    orderBy: { name: "asc" },
  });

  const deviceIds = devices.map((device) => device.id);

  const activeSessions = await prisma.rentalSession.findMany({
    where: {
      deviceId: { in: deviceIds },
      completedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        include: { snack: true },
      },
    },
  });

  const now = new Date();
  for (const session of activeSessions) {
    if (
      session.mode === "timed" &&
      session.endAt &&
      !session.stoppedAt &&
      session.endAt.getTime() <= now.getTime()
    ) {
      await prisma.rentalSession.update({
        where: { id: session.id },
        data: { stoppedAt: session.endAt },
      });
      session.stoppedAt = session.endAt;
    }
  }

  const activeSessionByDevice = new Map(
    activeSessions.map((session) => [session.deviceId, session])
  );

  const lastSessionByDevice = new Map<string, typeof activeSessions[number]>();
  for (const device of devices) {
    const lastSession = await prisma.rentalSession.findFirst({
      where: {
        deviceId: device.id,
        completedAt: { not: null },
      },
      orderBy: { completedAt: "desc" },
    });
    if (lastSession) {
      lastSessionByDevice.set(device.id, lastSession);
    }
  }

  const payload = devices.map((device) => {
    const session = activeSessionByDevice.get(device.id) ?? null;
    const lastSession = lastSessionByDevice.get(device.id) ?? null;

    return {
      id: device.id,
      name: device.name,
      model: device.model,
      status: device.status,
      ratePerHour: device.rate,
      session: session
        ? {
            id: session.id,
            mode: session.mode,
            ratePerHour: session.ratePerHour,
            startAt: session.startAt.toISOString(),
            durationMinutes: session.durationMinutes ?? null,
            endAt: toIso(session.endAt),
            stoppedAt: toIso(session.stoppedAt),
          }
        : null,
      orders: session
        ? session.orders.map((order) => ({
            snackId: order.snackId,
            name: order.snack.name,
            category: order.snack.category,
            price: order.price,
            qty: order.qty,
          }))
        : [],
      lastSession: lastSession
        ? {
            startAt: lastSession.startAt.toISOString(),
            endAt: (
              lastSession.completedAt ??
              lastSession.stoppedAt ??
              lastSession.endAt ??
              lastSession.startAt
            ).toISOString(),
          }
        : null,
    };
  });

  return NextResponse.json(payload);
}
