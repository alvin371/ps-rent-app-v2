import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { deviceTypeSchema } from "@/lib/api/schemas";
import { serializeDeviceType } from "@/lib/api/serializers";
import { requireAuth } from "@/lib/auth/guards";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

export async function GET() {
  const auth = await requireAuth("devices:read");
  if (auth.response) {
    return auth.response;
  }

  const deviceTypes = await prisma.deviceType.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(deviceTypes.map(serializeDeviceType));
}

export async function POST(request: Request) {
  const auth = await requireAuth("devices:write");
  if (auth.response) {
    return auth.response;
  }

  const body = await request.json();
  const parsed = deviceTypeSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const created = await prisma.deviceType.create({ data: parsed.data });

  return NextResponse.json(serializeDeviceType(created), { status: 201 });
}
