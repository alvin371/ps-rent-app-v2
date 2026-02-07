import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { deviceUpdateSchema } from "@/lib/api/schemas";
import { serializeDevice } from "@/lib/api/serializers";
import { requireAuth } from "@/lib/auth/guards";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

const notFound = () =>
  NextResponse.json({ error: "Device not found" }, { status: 404 });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("devices:read");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const device = await prisma.device.findUnique({ where: { id } });

  if (!device) {
    return notFound();
  }

  return NextResponse.json(serializeDevice(device));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("devices:write");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = deviceUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const existing = await prisma.device.findUnique({ where: { id } });
  if (!existing) {
    return notFound();
  }

  const updated = await prisma.device.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(serializeDevice(updated));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("devices:write");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const existing = await prisma.device.findUnique({ where: { id } });

  if (!existing) {
    return notFound();
  }

  const deleted = await prisma.device.delete({ where: { id } });

  return NextResponse.json(serializeDevice(deleted));
}
