import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/api/schemas";
import { serializePayment } from "@/lib/api/serializers";
import { requireAuth } from "@/lib/auth/guards";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

export async function GET() {
  const auth = await requireAuth("payments:read");
  if (auth.response) {
    return auth.response;
  }

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments.map(serializePayment));
}

export async function POST(request: Request) {
  const auth = await requireAuth("payments:write");
  if (auth.response) {
    return auth.response;
  }

  const body = await request.json();
  const parsed = paymentSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const created = await prisma.payment.create({ data: parsed.data });

  return NextResponse.json(serializePayment(created), { status: 201 });
}
