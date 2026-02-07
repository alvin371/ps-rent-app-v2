import { redirect } from "next/navigation";

import { requirePagePermission } from "@/lib/auth/page";

export default async function EmployeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guard = await requirePagePermission("employees:read");
  if (guard.redirectTo) {
    redirect(guard.redirectTo);
  }

  return children;
}
