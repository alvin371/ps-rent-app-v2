import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { snackSchema } from "@/lib/api/schemas";
import { serializeSnack } from "@/lib/api/serializers";
import { requireAuth } from "@/lib/auth/guards";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

export async function GET() {
  const auth = await requireAuth("snacks:read");
  if (auth.response) {
    return auth.response;
  }

  const snacks = await prisma.snack.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(snacks.map(serializeSnack));
}

export async function POST(request: Request) {
  const auth = await requireAuth("snacks:write");
  if (auth.response) {
    return auth.response;
  }

  const body = await request.json();
  const parsed = snackSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const created = await prisma.snack.create({ data: parsed.data });

  return NextResponse.json(serializeSnack(created), { status: 201 });
}
