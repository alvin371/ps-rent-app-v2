import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "gc_session";
const SESSION_TTL_DAYS = 7;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const getCookieValue = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
};

export const getSessionCookieName = () => SESSION_COOKIE;

export const createSession = async (options: {
  employeeId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) => {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const session = await prisma.authSession.create({
    data: {
      employeeId: options.employeeId,
      tokenHash,
      expiresAt,
      ipAddress: options.ipAddress ?? undefined,
      userAgent: options.userAgent ?? undefined,
    },
  });

  return { token, expiresAt, session };
};

export const revokeSession = async (token: string) => {
  const tokenHash = hashToken(token);
  await prisma.authSession.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const getCurrentSession = async () => {
  const token = await getCookieValue();
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.authSession.findUnique({
    where: { tokenHash },
    include: { employee: true },
  });

  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    return null;
  }

  return { session, token, employee: session.employee };
};

export const getSessionToken = () => getCookieValue();

export const buildSessionCookie = (token: string, expiresAt: Date) => ({
  name: SESSION_COOKIE,
  value: token,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  },
});

export const buildClearSessionCookie = () => ({
  name: SESSION_COOKIE,
  value: "",
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(0),
  },
});
