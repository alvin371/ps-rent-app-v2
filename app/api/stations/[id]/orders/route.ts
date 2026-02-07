import { NextResponse } from "next/server";

import { orderAdjustSchema } from "@/lib/api/schemas";
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
  const parsed = orderAdjustSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const session = await prisma.rentalSession.findFirst({
    where: { deviceId: id, completedAt: null },
  });
  if (!session) {
    return notFound();
  }
  if (session.stoppedAt) {
    return NextResponse.json(
      { error: "Session already stopped" },
      { status: 409 }
    );
  }

  const snack = await prisma.snack.findUnique({
    where: { id: parsed.data.snackId },
  });
  if (!snack) {
    return NextResponse.json({ error: "Snack not found" }, { status: 404 });
  }
  if (!snack.isActive) {
    return NextResponse.json({ error: "Snack is inactive" }, { status: 409 });
  }

  const existing = await prisma.rentalOrderItem.findFirst({
    where: {
      sessionId: session.id,
      snackId: parsed.data.snackId,
    },
  });

  const nextQty = (existing?.qty ?? 0) + parsed.data.delta;
  if (nextQty <= 0) {
    if (existing) {
      await prisma.rentalOrderItem.delete({ where: { id: existing.id } });
    }
    return NextResponse.json({ ok: true });
  }

  if (existing) {
    await prisma.rentalOrderItem.update({
      where: { id: existing.id },
      data: { qty: nextQty },
    });
  } else {
    await prisma.rentalOrderItem.create({
      data: {
        sessionId: session.id,
        snackId: snack.id,
        qty: nextQty,
        price: snack.sellPrice,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
