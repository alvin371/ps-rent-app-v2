import { redirect } from "next/navigation";

import { requirePagePermission } from "@/lib/auth/page";

export default async function DevicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guard = await requirePagePermission("devices:read");
  if (guard.redirectTo) {
    redirect(guard.redirectTo);
  }

  return children;
}
