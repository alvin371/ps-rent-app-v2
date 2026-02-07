import { NextResponse } from "next/server";

import { checkoutSchema } from "@/lib/api/schemas";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

const notFound = () =>
  NextResponse.json({ error: "Active session not found" }, { status: 404 });

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

const getRentalCost = (session: {
  mode: "open" | "timed";
  startAt: Date;
  ratePerHour: number;
  durationMinutes: number | null;
  endAt: Date | null;
  stoppedAt: Date | null;
}, now: Date) => {
  if (session.mode === "timed") {
    const minutes = session.durationMinutes ?? 0;
    return Math.round((minutes * session.ratePerHour) / 60);
  }
  const stoppedAt = session.stoppedAt ?? now;
  const elapsedMs = Math.max(0, stoppedAt.getTime() - session.startAt.getTime());
  return Math.round((elapsedMs * session.ratePerHour) / HOUR_MS);
};

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
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.rentalSession.findFirst({
      where: { deviceId: id, completedAt: null },
      include: {
        device: true,
        orders: { include: { snack: true } },
      },
    });

    if (!session) {
      return { error: notFound() } as const;
    }

    const now = new Date();
    const endAt =
      session.mode === "timed" && session.durationMinutes
        ? new Date(session.startAt.getTime() + session.durationMinutes * MINUTE_MS)
        : session.endAt;
    const stoppedAt = session.stoppedAt
      ? session.stoppedAt
      : endAt
        ? new Date(Math.min(now.getTime(), endAt.getTime()))
        : now;

    const rentalCost = getRentalCost(
      {
        mode: session.mode,
        startAt: session.startAt,
        ratePerHour: session.ratePerHour,
        durationMinutes: session.durationMinutes,
        endAt,
        stoppedAt,
      },
      now
    );

    const snacksTotal = session.orders.reduce(
      (total, order) => total + order.price * order.qty,
      0
    );

    const transactions = [] as {
      type: "Rental" | "Snack";
      description: string;
      amount: number;
    }[];

    if (rentalCost > 0) {
      transactions.push({
        type: "Rental",
        description: `${session.device.name} - Rental`,
        amount: rentalCost,
      });
    }

    if (snacksTotal > 0) {
      const snackNames = session.orders
        .map((order) => `${order.qty}x ${order.snack.name}`)
        .slice(0, 3)
        .join(", ");
      transactions.push({
        type: "Snack",
        description: snackNames || "Snack orders",
        amount: snacksTotal,
      });
    }

    await tx.rentalSession.update({
      where: { id: session.id },
      data: {
        stoppedAt,
        endAt: endAt ?? undefined,
        completedAt: now,
        paymentMethod: parsed.data.paymentMethod,
      },
    });

    if (session.orders.length > 0) {
      for (const order of session.orders) {
        await tx.snack.update({
          where: { id: order.snackId },
          data: {
            stockOnHand: {
              decrement: order.qty,
            },
          },
        });
      }
    }

    if (transactions.length > 0) {
      await tx.transaction.createMany({
        data: transactions.map((entry) => ({
          type: entry.type,
          description: entry.description,
          notes: "Auto-generated from checkout.",
          amount: entry.amount,
          occurredAt: now,
          sessionId: session.id,
          employeeId: auth.employee?.id,
        })),
      });
    }

    return { error: null } as const;
  });

  if (result.error) {
    return result.error;
  }

  return NextResponse.json({ ok: true });
}
