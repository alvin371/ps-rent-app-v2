import { NextResponse } from "next/server";

import { serializeEmployee } from "@/lib/api/serializers";
import { getRolePermissions } from "@/lib/auth/permissions";
import { getCurrentSession } from "@/lib/auth/session";

export async function GET() {
  const current = await getCurrentSession();
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: serializeEmployee(current.employee),
    permissions: getRolePermissions(current.employee.role),
  });
}
