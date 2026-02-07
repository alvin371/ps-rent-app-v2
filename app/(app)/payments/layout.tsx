import { redirect } from "next/navigation";

import { requirePagePermission } from "@/lib/auth/page";

export default async function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guard = await requirePagePermission("payments:read");
  if (guard.redirectTo) {
    redirect(guard.redirectTo);
  }

  return children;
}
