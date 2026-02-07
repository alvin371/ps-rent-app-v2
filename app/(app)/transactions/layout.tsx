import { redirect } from "next/navigation";

import { requirePagePermission } from "@/lib/auth/page";

export default async function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guard = await requirePagePermission("transactions:read");
  if (guard.redirectTo) {
    redirect(guard.redirectTo);
  }

  return children;
}
