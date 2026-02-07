"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api/client";

type Employee = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "Manager" | "Admin" | "Cashier";
  status: "Active" | "Inactive";
  lastLogin: string;
};

type EmployeeRow = Employee & {
  initials: string;
  avatarTone: string;
};

const roleToneMap: Record<string, string> = {
  Manager: "bg-[#eaf0ff] text-[#4f5bff]",
  Admin: "bg-[#f1e9ff] text-[#8b5cf6]",
  Cashier: "bg-[#e9f1ff] text-[#5b6cff]",
};

const statusToneMap: Record<string, string> = {
  Active: "bg-[#e7f7ee] text-[#22c55e]",
  Inactive: "bg-[#feecec] text-[#f04747]",
};

const avatarPalette = [
  "bg-[#efe9ff] text-[#7b61ff]",
  "bg-[#ffe9d6] text-[#f97316]",
  "bg-[#dff7f3] text-[#1fb6a6]",
  "bg-[#eef1f6] text-[#a3acba]",
  "bg-[#ffe6f1] text-[#f472b6]",
];

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const formatLastLogin = (value: string) => {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await apiFetch<Employee[]>("/api/employees");
        if (!isMounted) return;
        setEmployees(
          data.map((employee, index) => ({
            ...employee,
            lastLogin: formatLastLogin(employee.lastLogin),
            initials: getInitials(employee.name),
            avatarTone: avatarPalette[index % avatarPalette.length],
          }))
        );
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
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1f2433]">
            Employee Management
          </h1>
          <p className="text-xs text-[#8a93a5]">
            Manage staff accounts and access levels
          </p>
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-[360px]">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa2b1]"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="7"
              cy="7"
              r="4.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M10.5 10.5L14 14"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, role or username..."
            className="h-10 w-full rounded-lg border border-[#e6eaf2] bg-white pl-9 pr-4 text-sm text-[#1f2433] placeholder:text-[#9aa2b1]"
          />
        </div>
        <Link
          href="/employees/create"
          className="flex items-center gap-2 rounded-lg bg-[#f04747] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(240,71,71,0.25)]"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="6.3"
                cy="5.2"
                r="2.2"
                stroke="white"
                strokeWidth="1.2"
              />
              <path
                d="M2.5 12.2C3 10.8 4.2 10 6.2 10C8.2 10 9.4 10.8 9.9 12.2"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M12 5.2V9.2"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M10 7.2H14"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          Add New Employee
        </Link>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-[#f8caca] bg-[#feecec] px-4 py-3 text-xs text-[#f04747]">
          {loadError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-[#e6eaf2] bg-white px-4 py-4 text-xs text-[#9aa2b1]">
          Loading employees...
        </div>
      ) : null}

      <div className="rounded-xl border border-[#e6eaf2] bg-white">
        <div className="grid grid-cols-[2.2fr_1fr_1fr_1fr_1.2fr_0.8fr] gap-4 border-b border-[#eef1f6] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9aa2b1]">
          <div>Profile</div>
          <div>Username</div>
          <div>Role</div>
          <div>Status</div>
          <div>Last Login</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="divide-y divide-[#eef1f6]">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="grid cursor-pointer grid-cols-[2.2fr_1fr_1fr_1fr_1.2fr_0.8fr] items-center gap-4 px-4 py-3 transition hover:bg-[#f8f9fc]"
              onClick={() => router.push(`/employees/${employee.id}`)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${employee.avatarTone}`}
                >
                  {employee.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1f2433]">
                    {employee.name}
                  </p>
                  <p className="text-[11px] text-[#9aa2b1]">
                    {employee.email}
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#6b7280]">{employee.username}</div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${roleToneMap[employee.role]}`}
                >
                  {employee.role}
                </span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${statusToneMap[employee.status]}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {employee.status}
                </span>
              </div>
              <div className="text-xs text-[#6b7280]">
                {employee.lastLogin}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  className="flex h-7 w-7 items-center justify-center text-[#4f5bff]"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(`/employees/${employee.id}`);
                  }}
                  aria-label={`Edit ${employee.name}`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M11.8 2.7L13.3 4.2L5.2 12.3H3.7V10.8L11.8 2.7Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.7 3.8L12.2 5.3"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  className="flex h-7 w-7 items-center justify-center text-[#9aa2b1]"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(`/employees/${employee.id}`);
                  }}
                  aria-label={`View ${employee.name}`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M1.5 8C2.9 5.2 5.2 4 8 4C10.8 4 13.1 5.2 14.5 8C13.1 10.8 10.8 12 8 12C5.2 12 2.9 10.8 1.5 8Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="8"
                      cy="8"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                </button>
                <button
                  className={`flex h-7 w-7 items-center justify-center ${
                    employee.status === "Inactive"
                      ? "text-[#f04747]"
                      : "text-[#c0c6d4]"
                  }`}
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`Deactivate ${employee.name}`}
                >
                  <svg
                    width="14"
                    height="14"
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
                      d="M4.8 11.2L11.2 4.8"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#eef1f6] px-4 py-3 text-xs text-[#9aa2b1]">
          <p>Showing 1 to 5 of 24 results</p>
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6eaf2] text-[#9aa2b1]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10 3L6 8L10 13"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#4f5bff] bg-[#f3f5ff] text-xs font-semibold text-[#4f5bff]">
              1
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6eaf2] text-xs font-semibold text-[#9aa2b1]">
              2
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6eaf2] text-xs font-semibold text-[#9aa2b1]">
              3
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6eaf2] text-[#9aa2b1]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6 3L10 8L6 13"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
