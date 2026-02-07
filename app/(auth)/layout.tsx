import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentSession();
  if (current) {
    redirect("/dashboard");
  }

  return children;
}
