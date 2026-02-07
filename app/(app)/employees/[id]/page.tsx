"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { apiFetch } from "@/lib/api/client";

type Employee = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "Manager" | "Admin" | "Cashier";
};

const moduleAccess = [
  {
    name: "Rental Management",
    icon: "clock",
    permissions: ["Start/Stop Timer", "Edit Costs"],
  },
  {
    name: "Snack Inventory",
    icon: "box",
    permissions: ["Add Items", "Update Stock"],
  },
  {
    name: "Financials",
    icon: "chart",
    permissions: ["View Reports", "Export PDF"],
  },
  {
    name: "System",
    icon: "gear",
    permissions: ["Manage Devices", "Manage Employees"],
  },
];

const iconStyles = "h-4 w-4 text-[#9aa2b1]";

const ModuleIcon = ({ name }: { name: string }) => {
  if (name === "box") {
    return (
      <svg
        className={iconStyles}
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
        <path d="M8 8V14.4" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg
        className={iconStyles}
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
    );
  }

  if (name === "gear") {
    return (
      <svg
        className={iconStyles}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M8 2.3V3.6M8 12.4V13.7M3.6 8H2.3M13.7 8H12.4M4.1 4.1L3.2 3.2M12.8 12.8L11.9 11.9M11.9 4.1L12.8 3.2M3.2 12.8L4.1 11.9"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className={iconStyles}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 4.5V8.2L10.4 9.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = params?.id as string | undefined;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await apiFetch<Employee>(`/api/employees/${employeeId}`);
        if (!isMounted) return;
        setEmployee(data);
      } catch (err) {
        if (!isMounted) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [employeeId]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/employees"
            className="mt-1 flex h-8 w-8 items-center justify-center text-[#9aa2b1]"
            aria-label="Go back"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12.5 4.5L7.5 10L12.5 15.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[#1f2433]">
              Employee Detail
            </h1>
            <p className="text-xs text-[#8a93a5]">
              Review staff member and configure permissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#e6eaf2] bg-white text-[#9aa2b1]">
            <svg
              width="16"
              height="18"
              viewBox="0 0 16 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M8 1.5C6.067 1.5 4.5 3.067 4.5 5V7.7C4.5 8.2 4.3 8.68 3.94 9.04L2.9 10.08C2.28 10.7 2.72 11.75 3.6 11.75H12.4C13.28 11.75 13.72 10.7 13.1 10.08L12.06 9.04C11.7 8.68 11.5 8.2 11.5 7.7V5C11.5 3.067 9.933 1.5 8 1.5Z"
                stroke="#9aa2b1"
                strokeWidth="1.2"
              />
              <path
                d="M6.5 14.5C6.7 15.4 7.48 16 8.4 16C9.32 16 10.1 15.4 10.3 14.5"
                stroke="#9aa2b1"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e6eaf2] bg-[#f4f6fb] text-sm font-semibold text-[#6b7280]">
            A
          </div>
        </div>
      </header>

      {loadError ? (
        <div className="rounded-xl border border-[#f8caca] bg-[#feecec] px-4 py-3 text-xs text-[#f04747]">
          {loadError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-[#e6eaf2] bg-white px-4 py-4 text-xs text-[#9aa2b1]">
          Loading employee...
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5">
          <div className="border-b border-[#eef1f6] pb-3">
            <h2 className="text-sm font-semibold text-[#1f2433]">
              Basic Information
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#d4d9e2] text-[#b7bfcd]">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="9"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M5 20C6.3 16.5 9 15 12 15C15 15 17.7 16.5 19 20"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  aria-label="Upload profile"
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#f04747] text-white shadow-[0_6px_12px_rgba(240,71,71,0.35)]"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 4V12"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4 8H12"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1f2433]">
                  Profile Photo
                </p>
                <p className="text-[11px] text-[#9aa2b1]">
                  Accepts JPG, PNG or GIF. Max size of 800K.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#9aa2b1]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={employee?.name ?? ""}
                  readOnly
                  className="mt-2 h-10 w-full rounded-lg border border-[#e6eaf2] bg-white px-3 text-sm text-[#1f2433] placeholder:text-[#b0b8c7]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#9aa2b1]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={employee?.email ?? ""}
                  readOnly
                  className="mt-2 h-10 w-full rounded-lg border border-[#e6eaf2] bg-white px-3 text-sm text-[#1f2433] placeholder:text-[#b0b8c7]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#9aa2b1]">
                  Username
                </label>
                <input
                  type="text"
                  value={employee?.username ?? ""}
                  readOnly
                  className="mt-2 h-10 w-full rounded-lg border border-[#e6eaf2] bg-white px-3 text-sm text-[#1f2433] placeholder:text-[#b0b8c7]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#9aa2b1]">
                  Password
                </label>
                <input
                  type="password"
                  value="********"
                  readOnly
                  className="mt-2 h-10 w-full rounded-lg border border-[#e6eaf2] bg-white px-3 text-sm text-[#1f2433] placeholder:text-[#b0b8c7]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5">
          <div className="border-b border-[#eef1f6] pb-3">
            <h2 className="text-sm font-semibold text-[#1f2433]">
              Role & Permissions
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-[#9aa2b1]">
                Assign Role
              </label>
              <div className="relative mt-2">
                <select
                  value={employee?.role ?? "Cashier"}
                  disabled
                  className="h-10 w-full appearance-none rounded-lg border border-[#e6eaf2] bg-white px-3 pr-9 text-sm text-[#1f2433]"
                >
                  <option>Cashier</option>
                  <option>Admin</option>
                  <option>Manager</option>
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa2b1]"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="mt-2 text-[11px] text-[#9aa2b1]">
                Selecting a role will auto-populate default permissions.
              </p>
            </div>

            <div className="pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9aa2b1]">
                Module Access
              </p>
              <div className="mt-3 space-y-3">
                {moduleAccess.map((module) => (
                  <div
                    key={module.name}
                    className="rounded-xl border border-[#eef1f6] bg-[#f8f9fc] px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#1f2433]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e6eaf2] bg-white">
                          <ModuleIcon name={module.icon} />
                        </span>
                        {module.name}
                      </div>
                      <div className="grid min-w-[220px] grid-cols-2 gap-x-6 gap-y-2 text-xs text-[#6b7280]">
                        {module.permissions.map((permission) => (
                          <label
                            key={permission}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              className="h-3.5 w-3.5 rounded border-[#cfd6e5] accent-[#4f5bff]"
                            />
                            {permission}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <Link
          href="/employees"
          className="rounded-lg border border-[#e6eaf2] bg-white px-5 py-2 text-sm text-[#6b7280]"
        >
          Cancel
        </Link>
        <button
          type="button"
          className="rounded-lg bg-[#f04747] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(240,71,71,0.25)]"
        >
          Update Employee
        </button>
      </div>
    </div>
  );
}
