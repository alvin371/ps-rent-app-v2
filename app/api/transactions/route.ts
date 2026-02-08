import { NextResponse } from "next/server";

import { transactionCreateSchema } from "@/lib/api/schemas";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

const notFound = () =>
  NextResponse.json({ error: "Snack not found" }, { status: 404 });

export async function GET(request: Request) {
  const auth = await requireAuth("transactions:read");
  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");

  let whereClause = {};
  if (dateParam) {
    const targetDate = new Date(dateParam);
    if (!isNaN(targetDate.getTime())) {
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
      whereClause = {
        occurredAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: { occurredAt: "desc" },
    include: {
      employee: {
        select: { name: true },
      },
      session: {
        select: { paymentMethod: true },
      },
    },
  });

  return NextResponse.json(
    transactions.map((entry) => ({
      id: entry.id,
      name: entry.description,
      notes: entry.notes,
      occurredAt: entry.occurredAt.toISOString(),
      employeeName: entry.employee?.name ?? null,
      amount: entry.amount,
      type: entry.type,
      paymentMethod: entry.session?.paymentMethod ?? null,
    }))
  );
}

export async function POST(request: Request) {
  const auth = await requireAuth("transactions:read");
  if (auth.response) {
    return auth.response;
  }

  const body = await request.json();
  const parsed = transactionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const { kind, snackId, qty, description, amount, notes, occurredAt } =
    parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    let snackName: string | null = null;
    if (kind === "inventory") {
      const snackIdValue = snackId;
      if (!snackIdValue) {
        return { error: badRequest({ snackId: "Snack is required." }) } as const;
      }
      const qtyValue = qty ?? 0;
      const snack = await tx.snack.findUnique({
        where: { id: snackIdValue },
        select: { name: true },
      });
      if (!snack) {
        return { error: notFound() } as const;
      }
      snackName = snack.name;
      await tx.snack.update({
        where: { id: snackIdValue },
        data: {
          stockOnHand: {
            increment: qtyValue,
          },
        },
      });
    }

    const signedAmount = -Math.abs(amount);
    const finalDescription =
      kind === "inventory" && snackName
        ? `${description} (${snackName} +${qty ?? 0})`
        : description;

    const created = await tx.transaction.create({
      data: {
        type: "Expense",
        description: finalDescription,
        notes,
        amount: signedAmount,
        occurredAt,
        employeeId: auth.employee?.id,
      },
      include: {
        employee: { select: { name: true } },
      },
    });

    return { error: null, data: created } as const;
  });

  if (result.error) {
    return result.error;
  }

  const created = result.data;
  return NextResponse.json({
    id: created.id,
    name: created.description,
    notes: created.notes,
    occurredAt: created.occurredAt.toISOString(),
    employeeName: created.employee?.name ?? null,
    amount: created.amount,
  });
}
