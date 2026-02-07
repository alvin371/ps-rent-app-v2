import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { employeeCreateSchema } from "@/lib/api/schemas";
import { serializeEmployee } from "@/lib/api/serializers";
import { hashPassword } from "@/lib/auth/password";
import { requireAuth } from "@/lib/auth/guards";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

export async function GET() {
  const auth = await requireAuth("employees:read");
  if (auth.response) {
    return auth.response;
  }

  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(employees.map(serializeEmployee));
}

export async function POST(request: Request) {
  const auth = await requireAuth("employees:write");
  if (auth.response) {
    return auth.response;
  }

  const body = await request.json();
  const parsed = employeeCreateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const { password, ...data } = parsed.data;
  const passwordHash = await hashPassword(password);

  const created = await prisma.employee.create({
    data: {
      ...data,
      passwordHash,
    },
  });

  return NextResponse.json(serializeEmployee(created), { status: 201 });
}
