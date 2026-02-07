import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const parseDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

const MINUTE_MS = 60_000;

const getSessionMinutes = (session: {
  mode: "open" | "timed";
  startAt: Date;
  durationMinutes: number | null;
  completedAt: Date | null;
  stoppedAt: Date | null;
}) => {
  if (session.mode === "timed") {
    return session.durationMinutes ?? 0;
  }
  const endAt = session.completedAt ?? session.stoppedAt ?? new Date();
  return Math.max(0, Math.round((endAt.getTime() - session.startAt.getTime()) / MINUTE_MS));
};

export async function GET(request: Request) {
  const auth = await requireAuth("finance:read");
  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);
  const fromParam = parseDate(url.searchParams.get("from"));
  const toParam = parseDate(url.searchParams.get("to"));

  const now = new Date();
  const from = fromParam ?? startOfMonth(now);
  const to = toParam ?? endOfMonth(now);

  const transactions = await prisma.transaction.findMany({
    where: {
      occurredAt: {
        gte: from,
        lte: to,
      },
    },
    orderBy: { occurredAt: "desc" },
  });

  const totalIncome = transactions
    .filter((entry) => entry.amount > 0)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const totalOutcome = transactions
    .filter((entry) => entry.amount < 0)
    .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
  const netProfit = totalIncome - totalOutcome;

  const rentalIncome = transactions
    .filter((entry) => entry.type === "Rental")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const snackIncome = transactions
    .filter((entry) => entry.type === "Snack")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const incomeTotal = rentalIncome + snackIncome;
  const rentalPercent = incomeTotal ? Math.round((rentalIncome / incomeTotal) * 100) : 0;
  const snackPercent = incomeTotal ? Math.round((snackIncome / incomeTotal) * 100) : 0;

  const sessions = await prisma.rentalSession.findMany({
    where: {
      completedAt: {
        gte: from,
        lte: to,
      },
    },
    include: {
      device: true,
      orders: { include: { snack: true } },
    },
  });

  const deviceMinutes = new Map<string, number>();
  const snackQty = new Map<string, { name: string; qty: number; category: string }>();

  for (const session of sessions) {
    const minutes = getSessionMinutes(session);
    const current = deviceMinutes.get(session.device.name) ?? 0;
    deviceMinutes.set(session.device.name, current + minutes);

    for (const order of session.orders) {
      const existing = snackQty.get(order.snackId) ?? {
        name: order.snack.name,
        qty: 0,
        category: order.snack.category,
      };
      existing.qty += order.qty;
      snackQty.set(order.snackId, existing);
    }
  }

  const topDeviceEntry = [...deviceMinutes.entries()].sort((a, b) => b[1] - a[1])[0];
  const topSnackEntry = [...snackQty.values()].sort((a, b) => b.qty - a.qty)[0];
  const topDrinkEntry = [...snackQty.values()]
    .filter((item) => /drink|minum/i.test(item.category))
    .sort((a, b) => b.qty - a.qty)[0];

  const topSelling = [
    topDeviceEntry
      ? {
          label: topDeviceEntry[0],
          value: `${Math.max(1, Math.round(topDeviceEntry[1] / 60))} hrs`,
          icon: "gamepad",
        }
      : null,
    topSnackEntry
      ? {
          label: topSnackEntry.name,
          value: `${topSnackEntry.qty} qty`,
          icon: "snack",
        }
      : null,
    topDrinkEntry
      ? {
          label: topDrinkEntry.name,
          value: `${topDrinkEntry.qty} qty`,
          icon: "drink",
        }
      : null,
  ].filter(Boolean);

  return NextResponse.json({
    range: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
    summary: {
      totalIncome,
      totalOutcome,
      netProfit,
    },
    incomeSources: [
      {
        label: "Console Rentals",
        percent: rentalPercent,
        value: rentalIncome,
      },
      {
        label: "Snacks & Drinks",
        percent: snackPercent,
        value: snackIncome,
      },
    ],
    topSelling,
    transactions: transactions.map((entry) => ({
      id: entry.id,
      occurredAt: entry.occurredAt.toISOString(),
      type: entry.type,
      description: entry.description,
      amount: entry.amount,
    })),
  });
}
