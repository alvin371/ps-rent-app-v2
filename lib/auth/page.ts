import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission, type Permission } from "@/lib/auth/permissions";

export const requirePagePermission = async (permission: Permission) => {
  const current = await getCurrentSession();
  if (!current) {
    return { redirectTo: "/login", employee: null } as const;
  }

  if (!hasPermission(current.employee.role, permission)) {
    return { redirectTo: "/dashboard", employee: current.employee } as const;
  }

  return { redirectTo: null, employee: current.employee } as const;
};
