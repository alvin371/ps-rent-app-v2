"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  label: string;
  badge?: string;
};

export default function NavLink({ href, label, badge }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium transition ${
        isActive
          ? "bg-[var(--app-panel-soft)] text-[var(--app-ink)]"
          : "text-[var(--app-ink-muted)] hover:bg-white/70 hover:text-[var(--app-ink)]"
      }`}
    >
      <span>{label}</span>
      {badge ? (
        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[var(--app-ink-muted)]">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
