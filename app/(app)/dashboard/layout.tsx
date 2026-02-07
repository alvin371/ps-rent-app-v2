import { redirect } from "next/navigation";

import { requirePagePermission } from "@/lib/auth/page";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guard = await requirePagePermission("dashboard:read");
  if (guard.redirectTo) {
    redirect(guard.redirectTo);
  }

  return children;
}
