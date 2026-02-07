import { redirect } from "next/navigation";

import { requirePagePermission } from "@/lib/auth/page";

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guard = await requirePagePermission("finance:read");
  if (guard.redirectTo) {
    redirect(guard.redirectTo);
  }

  return children;
}
