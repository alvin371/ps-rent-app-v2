import { NextResponse } from "next/server";

import { loginSchema } from "@/lib/api/schemas";
import { serializeEmployee } from "@/lib/api/serializers";
import { verifyPassword } from "@/lib/auth/password";
import {
  buildSessionCookie,
  createSession,
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const badRequest = (issues: unknown) =>
  NextResponse.json(
    { error: "Invalid payload", issues },
    { status: 400 }
  );

const unauthorized = () =>
  NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

const extractIp = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }
  return request.headers.get("x-real-ip");
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest({ message: "Invalid JSON" });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.flatten());
  }

  const { username, password } = parsed.data;
  const employee = await prisma.employee.findUnique({
    where: { username },
  });

  if (!employee || employee.status === "Inactive") {
    return unauthorized();
  }

  const isValid = await verifyPassword(password, employee.passwordHash);
  if (!isValid) {
    return unauthorized();
  }

  const { token, expiresAt } = await createSession({
    employeeId: employee.id,
    ipAddress: extractIp(request),
    userAgent: request.headers.get("user-agent"),
  });

  await prisma.employee.update({
    where: { id: employee.id },
    data: { lastLogin: new Date() },
  });

  const response = NextResponse.json({
    user: serializeEmployee(employee),
  });

  const cookie = buildSessionCookie(token, expiresAt);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
