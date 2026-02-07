import { redirect } from "next/navigation";

import { getRolePermissions } from "@/lib/auth/permissions";
import { getCurrentSession } from "@/lib/auth/session";

import Sidebar from "./_components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentSession();
  if (!current) {
    redirect("/login");
  }

  const employee = current.employee;
  const permissions = getRolePermissions(employee.role);

  return (
    <div className="h-screen overflow-hidden bg-[#f4f6fb] text-[#1f2433]">
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          user={{
            name: employee.name,
            role: employee.role,
          }}
          permissions={permissions}
        />
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="mx-auto min-h-full max-w-[1024px] px-8 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
