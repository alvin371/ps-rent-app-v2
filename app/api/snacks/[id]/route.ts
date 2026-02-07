import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { snackUpdateSchema } from "@/lib/api/schemas";
import { serializeSnack } from "@/lib/api/serializers";
import { requireAuth } from "@/lib/auth/guards";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

const notFound = () =>
  NextResponse.json({ error: "Snack not found" }, { status: 404 });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("snacks:read");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const snack = await prisma.snack.findUnique({ where: { id } });

  if (!snack) {
    return notFound();
  }

  return NextResponse.json(serializeSnack(snack));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("snacks:write");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = snackUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const existing = await prisma.snack.findUnique({ where: { id } });
  if (!existing) {
    return notFound();
  }

  const updated = await prisma.snack.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(serializeSnack(updated));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("snacks:write");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const existing = await prisma.snack.findUnique({ where: { id } });

  if (!existing) {
    return notFound();
  }

  const deleted = await prisma.snack.delete({ where: { id } });

  return NextResponse.json(serializeSnack(deleted));
}
