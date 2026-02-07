import { NextResponse } from "next/server";

import {
  buildClearSessionCookie,
  getSessionToken,
  revokeSession,
} from "@/lib/auth/session";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await revokeSession(token);
  }

  const response = NextResponse.json({ ok: true });
  const cookie = buildClearSessionCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
