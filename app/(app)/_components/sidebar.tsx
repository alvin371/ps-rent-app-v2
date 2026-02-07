"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import type { Permission } from "@/lib/auth/permissions";

type SidebarProps = {
  user: {
    name: string;
    role: string;
  };
  permissions: Permission[];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "U";
};

export default function Sidebar({ user, permissions }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isDevices = pathname === "/devices" || pathname.startsWith("/devices/");

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "grid",
      exact: true,
      permission: "dashboard:read" as const,
    },
    {
      label: "Dashboard Finance",
      href: "/dashboard/finance",
      icon: "chart",
      permission: "finance:read" as const,
    },
    {
      label: "Transactions",
      href: "/transactions",
      icon: "receipt",
      permission: "transactions:read" as const,
    },
    {
      label: "Devices",
      href: "/devices",
      icon: "box",
      permission: "devices:read" as const,
      children: [
        { label: "Device List", href: "/devices" },
        { label: "Snack List", href: "/devices/snacks" }
      ]
    },
    {
      label: "Employees",
      href: "/employees",
      icon: "users",
      permission: "employees:read" as const,
    },
    {
      label: "Payments",
      href: "/payments",
      icon: "clock",
      permission: "payments:read" as const,
    },
    { label: "Settings", href: "/settings", icon: "gear" }
  ];

  const visibleItems = navItems.filter((item) =>
    item.permission ? permissions.includes(item.permission) : true
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[#e6eaf2] bg-white px-6 py-5">
      <div className="pb-5 text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.35em]">
          <span className="text-[#f04747]">GAME</span>
          <span className="text-[#1f2433]">CENTER</span>
        </div>
        <div className="mt-5 h-px w-full bg-[#eef1f6]" />
      </div>

      <div className="mt-6 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9aa2b1]">
          Quick menu
        </p>
        <nav className="mt-3 space-y-2 text-sm font-medium">
          {visibleItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition ${
                    isActive
                      ? "bg-[#eef2ff] text-[#1f2433]"
                      : "text-[#6f7788] hover:bg-[#f6f7fb]"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center ${isActive ? "text-[#4f5bff]" : "text-[#9aa2b1]"}`}
                  >
                    {item.icon === "grid" ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="5"
                          height="5"
                          rx="1"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <rect
                          x="9"
                          y="2"
                          width="5"
                          height="5"
                          rx="1"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <rect
                          x="2"
                          y="9"
                          width="5"
                          height="5"
                          rx="1"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <rect
                          x="9"
                          y="9"
                          width="5"
                          height="5"
                          rx="1"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                      </svg>
                    ) : null}
                    {item.icon === "box" ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.5 5.2L8 2.4L13.5 5.2V11.6L8 14.4L2.5 11.6V5.2Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2.5 5.2L8 8L13.5 5.2"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M8 8V14.4"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                      </svg>
                    ) : null}
                    {item.icon === "chart" ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 12.5V9"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8 12.5V5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M13 12.5V7"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M2 12.5H14"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : null}
                    {item.icon === "receipt" ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 2.5H12C12.83 2.5 13.5 3.17 13.5 4V13.5L11.8 12.4L10.1 13.5L8.4 12.4L6.7 13.5L5 12.4L3.3 13.5V4C3.3 3.17 3.97 2.5 4.8 2.5H4Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5.5 6H11.5M5.5 8.5H10.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : null}
                    {item.icon === "users" ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <circle
                          cx="6"
                          cy="6"
                          r="2.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M2.8 12.5C3.4 10.7 4.6 9.8 6 9.8C7.4 9.8 8.6 10.7 9.2 12.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="11"
                          cy="6.5"
                          r="2"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M9.6 12.2C10 11 10.8 10.3 11.8 10.3C12.8 10.3 13.6 11 14 12.2"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : null}
                    {item.icon === "clock" ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <circle
                          cx="8"
                          cy="8"
                          r="5.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M8 4.5V8.2L10.4 9.6"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : null}
                    {item.icon === "gear" ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <circle
                          cx="8"
                          cy="8"
                          r="2.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M8 2.3V3.6M8 12.4V13.7M3.6 8H2.3M13.7 8H12.4M4.1 4.1L3.2 3.2M12.8 12.8L11.9 11.9M11.9 4.1L12.8 3.2M3.2 12.8L4.1 11.9"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                  {item.label}
                </Link>
                {item.children && isDevices ? (
                  <div className="ml-6 mt-2 border-l border-[#eef1f6] pl-3">
                    <div className="space-y-1 text-[11px] font-medium text-[#9aa2b1]">
                      {item.children.map((child) => {
                        const childActive =
                          child.href === "/devices"
                            ? pathname === child.href
                            : pathname === child.href ||
                              pathname.startsWith(`${child.href}/`);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition ${
                              childActive
                                ? "bg-[#f3f5ff] text-[#4f5bff]"
                                : "text-[#7b8496] hover:bg-[#f6f7fb]"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                childActive ? "bg-[#4f5bff]" : "bg-[#c7ccd8]"
                              }`}
                            />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[#eef1f6] pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e6eaf2] bg-[#f4f6fb] text-sm font-semibold text-[#6b7280]">
              {getInitials(user.name)}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1f2433]">
                {user.name}
              </p>
              <p className="text-[11px] text-[#9aa2b1]">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-[#e6eaf2] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#6b7280] hover:border-[#d7dce6]"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
