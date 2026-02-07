import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { employeeUpdateSchema } from "@/lib/api/schemas";
import { serializeEmployee } from "@/lib/api/serializers";
import { hashPassword } from "@/lib/auth/password";
import { requireAuth } from "@/lib/auth/guards";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

const notFound = () =>
  NextResponse.json({ error: "Employee not found" }, { status: 404 });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("employees:read");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id } });

  if (!employee) {
    return notFound();
  }

  return NextResponse.json(serializeEmployee(employee));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("employees:write");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = employeeUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) {
    return notFound();
  }

  const { password, ...data } = parsed.data;
  const updated = await prisma.employee.update({
    where: { id },
    data: {
      ...data,
      ...(password ? { passwordHash: await hashPassword(password) } : null),
    },
  });

  return NextResponse.json(serializeEmployee(updated));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth("employees:write");
  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;
  const existing = await prisma.employee.findUnique({ where: { id } });

  if (!existing) {
    return notFound();
  }

  const deleted = await prisma.employee.delete({ where: { id } });

  return NextResponse.json(serializeEmployee(deleted));
}
