import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await requireAuth("finance:read");
  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  
  if (!dateParam) {
    return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
  }

  const targetDate = new Date(dateParam);
  const cashDrawer = await prisma.cashDrawer.findUnique({
    where: { date: targetDate },
  });

  // Get total sales (cash only) for the day
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      occurredAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      session: {
        select: { paymentMethod: true },
      },
    },
  });

  console.log(`Found ${transactions.length} transactions for ${dateParam}`);
  console.log('Sample transactions:', transactions.slice(0, 3).map(t => ({
    type: t.type,
    amount: t.amount,
    paymentMethod: t.session?.paymentMethod
  })));

  const totalSales = transactions
    .filter((t) => t.session?.paymentMethod === "cash" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  console.log(`Total sales (cash): ${totalSales}, Expenses: ${expenses}`);

  return NextResponse.json({
    cashDrawer,
    totalSales,
    expenses,
  });
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth("finance:write");
    if (auth.response) {
      return auth.response;
    }

    const body = await request.json();
    const {
      date,
      startingBalance,
      denom100k,
      denom75k,
      denom50k,
      denom20k,
      denom10k,
      denom5k,
      denom2k,
      denom1k,
      denom500,
      denom200,
      denom100,
    } = body;

    const targetDate = new Date(date);
    const today = new Date();
    
    // Compare dates in local timezone
    const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`;
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Only allow editing today's record
    if (targetDateStr !== todayStr) {
      return NextResponse.json(
        { error: "Can only edit today's cash drawer" },
        { status: 403 }
      );
    }

    const cashDrawer = await prisma.cashDrawer.upsert({
      where: { date: targetDate },
      update: {
        startingBalance,
        denom100k,
        denom75k,
        denom50k,
        denom20k,
        denom10k,
        denom5k,
        denom2k,
        denom1k,
        denom500,
        denom200,
        denom100,
        employeeId: auth.employee?.id,
      },
      create: {
        date: targetDate,
        startingBalance,
        denom100k,
        denom75k,
        denom50k,
        denom20k,
        denom10k,
        denom5k,
        denom2k,
        denom1k,
        denom500,
        denom200,
        denom100,
        employeeId: auth.employee?.id,
      },
    });

    return NextResponse.json(cashDrawer);
  } catch (error) {
    console.error("Cash drawer save error:", error);
    return NextResponse.json(
      { error: "Failed to save cash drawer", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
