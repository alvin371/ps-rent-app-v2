import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { paymentUpdateSchema } from "@/lib/api/schemas";
import { serializePayment } from "@/lib/api/serializers";
import { requireAuth } from "@/lib/auth/guards";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

const notFound = () =>
  NextResponse.json({ error: "Payment not found" }, { status: 404 });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("payments:read");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const payment = await prisma.payment.findUnique({ where: { id } });

  if (!payment) {
    return notFound();
  }

  return NextResponse.json(serializePayment(payment));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("payments:write");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = paymentUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) {
    return notFound();
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(serializePayment(updated));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("payments:write");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const existing = await prisma.payment.findUnique({ where: { id } });

  if (!existing) {
    return notFound();
  }

  const deleted = await prisma.payment.delete({ where: { id } });

  return NextResponse.json(serializePayment(deleted));
}
