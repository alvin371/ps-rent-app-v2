import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission, type Permission } from "@/lib/auth/permissions";

export const requireAuth = async (permission?: Permission) => {
  const current = await getCurrentSession();
  if (!current) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
      employee: null,
    };
  }

  const { employee } = current;
  if (permission && !hasPermission(employee.role, permission)) {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: current.session,
      employee,
    };
  }

  return { response: null, session: current.session, employee };
};
