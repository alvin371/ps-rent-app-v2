import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { deviceSchema } from "@/lib/api/schemas";
import { serializeDevice } from "@/lib/api/serializers";
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

  const devices = await prisma.device.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(devices.map(serializeDevice));
}

export async function POST(request: Request) {
  const auth = await requireAuth("devices:write");
  if (auth.response) {
    return auth.response;
  }

  const body = await request.json();
  const parsed = deviceSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const created = await prisma.device.create({
    data: parsed.data,
  });

  return NextResponse.json(serializeDevice(created), { status: 201 });
}
