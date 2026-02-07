import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { deviceTypeUpdateSchema } from "@/lib/api/schemas";
import { serializeDeviceType } from "@/lib/api/serializers";
import { requireAuth } from "@/lib/auth/guards";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

const notFound = () =>
  NextResponse.json({ error: "Device type not found" }, { status: 404 });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("devices:read");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const deviceType = await prisma.deviceType.findUnique({ where: { id } });

  if (!deviceType) {
    return notFound();
  }

  return NextResponse.json(serializeDeviceType(deviceType));
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
  const parsed = deviceTypeUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const existing = await prisma.deviceType.findUnique({ where: { id } });
  if (!existing) {
    return notFound();
  }

  const updated = await prisma.deviceType.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(serializeDeviceType(updated));
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
  const existing = await prisma.deviceType.findUnique({ where: { id } });

  if (!existing) {
    return notFound();
  }

  const deleted = await prisma.deviceType.delete({ where: { id } });

  return NextResponse.json(serializeDeviceType(deleted));
}
