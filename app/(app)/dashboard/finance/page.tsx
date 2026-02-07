"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api/client";

import { formatRupiah } from "../_components/format";

type FinanceResponse = {
  range: { from: string; to: string };
  summary: { totalIncome: number; totalOutcome: number; netProfit: number };
  incomeSources: { label: string; percent: number; value: number }[];
  topSelling: { label: string; value: string; icon: string }[];
  transactions: {
    id: string;
    occurredAt: string;
    type: "Rental" | "Snack" | "Expense";
    description: string;
    amount: number;
  }[];
};

const calendarIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="1.5" y="2.5" width="11" height="10" rx="2" stroke="#9aa2b1" strokeWidth="1.1" />
    <path d="M4 1.5V3.5M10 1.5V3.5" stroke="#9aa2b1" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M1.5 5.5H12.5" stroke="#9aa2b1" strokeWidth="1.1" />
  </svg>
);

export default function FinancePage() {
  const [data, setData] = useState<FinanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const formatRangeDate = (value: string | undefined) => {
    if (!value) return "--/--/----";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--/--/----";
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTransactionDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTransactionTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await apiFetch<FinanceResponse>("/api/finance");
        if (!isMounted) return;
        setData(response);
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

  const summaryCards = useMemo(() => {
    const neutralTone = "text-[#9aa2b1] bg-[#f1f3f8]";
    const totalIncome = data?.summary.totalIncome ?? 0;
    const totalOutcome = data?.summary.totalOutcome ?? 0;
    const netProfit = data?.summary.netProfit ?? 0;
    return [
      {
        title: "Total Income",
        value: formatRupiah(totalIncome),
        trend: "—",
        trendTone: neutralTone,
        icon: (
          <svg
            width="16"
            height="14"
            viewBox="0 0 16 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="1.2" y="3" width="13.6" height="9" rx="2" stroke="#9be2b8" strokeWidth="1.2" />
            <circle cx="8" cy="7.5" r="2" fill="#9be2b8" />
            <path d="M2.8 3V1.8H5" stroke="#9be2b8" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        title: "Total Outcome",
        value: formatRupiah(totalOutcome),
        trend: "—",
        trendTone: neutralTone,
        icon: (
          <svg
            width="16"
            height="14"
            viewBox="0 0 16 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M2 2H3.8L4.8 8.2H12.8L14 4.2H5.4" stroke="#f2b3b3" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="6.2" cy="11.2" r="1" fill="#f2b3b3" />
            <circle cx="11.8" cy="11.2" r="1" fill="#f2b3b3" />
          </svg>
        ),
      },
      {
        title: "Net Profit",
        value: formatRupiah(netProfit),
        trend: "—",
        trendTone: neutralTone,
        icon: (
          <svg
            width="16"
            height="14"
            viewBox="0 0 16 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="1.5" y="3" width="13" height="8.5" rx="2" stroke="#b9cfff" strokeWidth="1.2" />
            <rect x="3.5" y="1.5" width="5" height="3" rx="1" fill="#b9cfff" />
            <circle cx="10.5" cy="7.2" r="1.2" fill="#b9cfff" />
          </svg>
        ),
      },
    ];
  }, [data]);

  const incomeSources = useMemo(
    () =>
      (data?.incomeSources ?? []).map((source, index) => ({
        label: source.label,
        percent: source.percent,
        value: formatRupiah(source.value),
        color: index === 0 ? "bg-[#3b82f6]" : "bg-[#f59e0b]",
      })),
    [data]
  );

  const transactions = useMemo(() => {
    return (data?.transactions ?? []).map((entry) => {
      const isExpense = entry.amount < 0 || entry.type === "Expense";
      const amountValue = formatRupiah(Math.abs(entry.amount));
      return {
        id: entry.id,
        date: formatTransactionDate(entry.occurredAt),
        time: formatTransactionTime(entry.occurredAt),
        type: entry.type,
        typeTone:
          entry.type === "Rental"
            ? "bg-[#e9edff] text-[#4f5bff]"
            : entry.type === "Snack"
              ? "bg-[#fff3d6] text-[#f59e0b]"
              : "bg-[#ffe7e7] text-[#f04747]",
        description: entry.description,
        amount: `${isExpense ? "-" : "+"} ${amountValue}`,
        amountTone: isExpense ? "text-[#f04747]" : "text-[#22c55e]",
      };
    });
  }, [data]);

  const topSelling = data?.topSelling ?? [];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#1f2433]">
            Financial Overview
          </h1>
          <p className="text-xs text-[#8a93a5]">
            Track your revenue and expenses efficiently.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#e6eaf2] bg-white px-3 py-2 text-xs text-[#6b7280]">
          <div className="flex items-center gap-2">
            {calendarIcon}
            <span>{formatRangeDate(data?.range.from)}</span>
          </div>
          <span className="text-[#c4c9d3]">to</span>
          <div className="flex items-center gap-2">
            {calendarIcon}
            <span>{formatRangeDate(data?.range.to)}</span>
          </div>
          <button className="ml-2 rounded-md bg-[#f04747] px-3 py-1.5 text-[11px] font-semibold text-white">
            Filter
          </button>
        </div>
      </header>

      {loadError ? (
        <div className="rounded-xl border border-[#f8caca] bg-[#feecec] px-4 py-3 text-xs text-[#f04747]">
          {loadError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-[#e6eaf2] bg-white px-4 py-4 text-xs text-[#9aa2b1]">
          Loading finance data...
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-[#e6eaf2] bg-white px-5 py-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#9aa2b1]">{card.title}</p>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4f6fb]">
                {card.icon}
              </div>
            </div>
            <p className="mt-2 text-lg font-semibold text-[#1f2433]">
              {card.value}
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-[#9aa2b1]">
              <span className={`rounded-full px-2 py-0.5 ${card.trendTone}`}>
                {card.trend}
              </span>
              vs last month
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[2.1fr_1fr]">
        <div className="rounded-2xl border border-[#e6eaf2] bg-white">
          <div className="flex items-center justify-between border-b border-[#eef1f6] px-5 py-4">
            <p className="text-sm font-semibold text-[#1f2433]">
              Recent Transactions
            </p>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-[#f04747]"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-[1fr_0.6fr_1.4fr_0.7fr_0.4fr] gap-4 border-b border-[#eef1f6] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa2b1]">
            <span>Date</span>
            <span>Type</span>
            <span>Description</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-[#eef1f6]">
            {transactions.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_0.6fr_1.4fr_0.7fr_0.4fr] gap-4 px-5 py-3 text-xs text-[#6b7280]"
              >
                <div>
                  <p className="text-sm text-[#4b5563]">{row.date}</p>
                  <p className="text-[11px] text-[#9aa2b1]">{row.time}</p>
                </div>
                <div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${row.typeTone}`}
                  >
                    {row.type}
                  </span>
                </div>
                <p className="text-sm text-[#374151]">{row.description}</p>
                <p className={`text-sm font-semibold ${row.amountTone}`}>
                  {row.amount}
                </p>
                <div className="flex items-center">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f9ef] text-[11px] text-[#22c55e]">
                    ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-5 py-3 text-xs text-[#9aa2b1]">
            <span>Showing {transactions.length} transactions</span>
            <div className="flex items-center gap-2 text-sm">
              <button className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e6eaf2] text-[#9aa2b1]">
                ‹
              </button>
              <button className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e6eaf2] text-[#9aa2b1]">
                ›
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#e6eaf2] bg-white px-5 py-4">
            <p className="text-sm font-semibold text-[#1f2433]">
              Income Sources
            </p>
            <div className="mt-4 space-y-4">
              {incomeSources.map((source) => (
                <div key={source.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#6b7280]">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${source.color}`} />
                      {source.label}
                    </div>
                    <span className="font-semibold text-[#1f2433]">
                      {`${source.percent}%`}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#f1f3f8]">
                    <div
                      className={`h-2 rounded-full ${source.color}`}
                      style={{ width: `${source.percent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#9aa2b1]">{source.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-[#eef1f6] pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9aa2b1]">
                Top Selling Items
              </p>
              <div className="mt-3 space-y-3 text-xs text-[#6b7280]">
                {topSelling.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#f3f5f9] text-[#9aa2b1]">
                        {item.icon === "gamepad" ? (
                          <svg
                            width="12"
                            height="10"
                            viewBox="0 0 12 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <rect x="0.8" y="2" width="10.4" height="6" rx="3" stroke="currentColor" strokeWidth="1" />
                            <circle cx="3.5" cy="5" r="0.8" fill="currentColor" />
                            <circle cx="8.5" cy="4.2" r="0.6" fill="currentColor" />
                            <circle cx="9.6" cy="5.5" r="0.6" fill="currentColor" />
                          </svg>
                        ) : null}
                        {item.icon === "snack" ? (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M3 1.5H9L8 10.5H4L3 1.5Z"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinejoin="round"
                            />
                            <path d="M4 4H8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                          </svg>
                        ) : null}
                        {item.icon === "drink" ? (
                          <svg
                            width="10"
                            height="12"
                            viewBox="0 0 10 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path d="M2 1.5H8L7.2 11H2.8L2 1.5Z" stroke="currentColor" strokeWidth="1" />
                            <path d="M3 5H7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                          </svg>
                        ) : null}
                      </span>
                      {item.label}
                    </div>
                    <span className="font-semibold text-[#1f2433]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#f04747] px-5 py-4 text-white shadow-[0_14px_28px_rgba(240,71,71,0.3)]">
            <p className="text-sm font-semibold">Export Report</p>
            <p className="mt-2 text-xs text-white/80">
              Download detailed financial report in PDF or Excel format.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-xs font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-[9px]">
                  P
                </span>
                PDF
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-xs font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20 text-[9px]">
                  X
                </span>
                Excel
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
