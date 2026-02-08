"use client";

import { useEffect, useState } from "react";
import { Calendar, Printer, TrendingUp, TrendingDown, Banknote, QrCode, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

type Transaction = {
  id: string;
  name: string;
  notes: string;
  occurredAt: string;
  employeeName: string | null;
  amount: number;
  type: "Rental" | "Snack" | "Expense";
  paymentMethod: "cash" | "qris" | "debt" | null;
};

type FinanceData = {
  summary: {
    totalIncome: number;
    totalOutcome: number;
    netProfit: number;
  };
};

export default function DailyReportPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const dateObj = new Date(selectedDate);
        const [transactions, finance] = await Promise.all([
          apiFetch<Transaction[]>(`/api/transactions?date=${selectedDate}`),
          apiFetch<FinanceData>(`/api/finance?from=${selectedDate}T00:00:00&to=${selectedDate}T23:59:59`),
        ]);
        setAllTransactions(transactions);
        setFinanceData(finance);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedDate]);

  const cashRevenue = allTransactions
    .filter((t) => t.paymentMethod === "cash" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const qrisRevenue = allTransactions
    .filter((t) => t.paymentMethod === "qris" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRevenue = cashRevenue + qrisRevenue;
  const cashPercentage = totalRevenue ? Math.round((cashRevenue / totalRevenue) * 100) : 0;
  const qrisPercentage = totalRevenue ? Math.round((qrisRevenue / totalRevenue) * 100) : 0;

  const totalIncome = financeData?.summary.totalIncome ?? 0;
  const totalOutcome = financeData?.summary.totalOutcome ?? 0;
  const netProfit = financeData?.summary.netProfit ?? 0;
  const marginRate = totalIncome ? ((netProfit / totalIncome) * 100).toFixed(1) : "0.0";

  const totalPages = Math.ceil(allTransactions.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedTransactions = allTransactions.slice(startIndex, startIndex + perPage);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  };

  const handlePrintReport = () => {
    window.open(`/api/daily-report/pdf?date=${selectedDate}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-[1024px] space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1f2433]">
            Daily Financial Summary Report
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8a93a5]">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDisplayDate(selectedDate)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#e6eaf2] bg-white px-3 py-2 text-xs text-[#6b7280] focus:border-[#4f5bff] focus:outline-none"
          />
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8a93a5]">
              NET PROFIT TODAY
            </div>
            <div className="text-2xl font-bold text-[#22c55e]">
              Rp {netProfit.toLocaleString("id-ID")}
            </div>
          </div>
          <button
            onClick={handlePrintReport}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e6eaf2] bg-white text-[#6b7280] transition-colors hover:bg-[#f9fafb]"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="rounded-2xl border border-[#e6eaf2] bg-white px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-[#8a93a5]">Total Income</div>
              <div className="mt-1 text-2xl font-bold text-[#1f2433]">
                Rp {totalIncome.toLocaleString("id-ID")}
              </div>
              <div className="mt-1 text-[11px] text-[#9aa2b1]">
                All sales and rentals combined
              </div>
            </div>
            <div className="rounded-lg bg-[#e7f7ee] p-2">
              <TrendingUp className="h-4 w-4 text-[#22c55e]" />
            </div>
          </div>
        </div>

        {/* Total Outcome */}
        <div className="rounded-2xl border border-[#e6eaf2] bg-white px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-[#8a93a5]">Total Outcome</div>
              <div className="mt-1 text-2xl font-bold text-[#1f2433]">
                Rp {totalOutcome.toLocaleString("id-ID")}
              </div>
              <div className="mt-1 text-[11px] text-[#9aa2b1]">
                Daily operational costs & supplies
              </div>
            </div>
            <div className="rounded-lg bg-[#feecec] p-2">
              <TrendingDown className="h-4 w-4 text-[#f04747]" />
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="rounded-2xl border border-[#e6eaf2] bg-white px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-[#22c55e]">Net Profit</div>
              <div className="mt-1 text-2xl font-bold text-[#22c55e]">
                Rp {netProfit.toLocaleString("id-ID")}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="rounded-md bg-[#e7f7ee] px-1.5 py-0.5 text-[11px] font-semibold text-[#22c55e]">
                  +{marginRate}%
                </span>
                <span className="text-[11px] text-[#9aa2b1]">Margin rate</span>
              </div>
            </div>
            <div className="rounded-lg bg-[#e7f7ee] p-2">
              <Banknote className="h-4 w-4 text-[#22c55e]" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div>
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa2b1]">
          PAYMENT METHOD BREAKDOWN
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Cash Revenue */}
          <div className="rounded-2xl border border-[#e6eaf2] bg-[#1f2433] px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-white/60">Total Cash Revenue</div>
                <div className="mt-1 text-3xl font-bold text-white">
                  Rp {cashRevenue.toLocaleString("id-ID")}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/50">
                  <TrendingUp className="h-3 w-3" />
                  <span>{cashPercentage}%</span>
                  <span>of total revenue</span>
                </div>
              </div>
              <div className="rounded-xl bg-[#2d3748] p-3">
                <Banknote className="h-6 w-6 text-[#22c55e]" />
              </div>
            </div>
          </div>

          {/* QRIS Revenue */}
          <div className="rounded-2xl border border-[#e6eaf2] bg-[#f04747] px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-white/60">Total QRIS Revenue</div>
                <div className="mt-1 text-3xl font-bold text-white">
                  Rp {qrisRevenue.toLocaleString("id-ID")}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/50">
                  <TrendingUp className="h-3 w-3" />
                  <span>{qrisPercentage}%</span>
                  <span>of total revenue</span>
                </div>
              </div>
              <div className="rounded-xl bg-[#dc3545] p-3">
                <QrCode className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Distribution */}
      <div className="rounded-2xl border border-[#e6eaf2] bg-white px-6 py-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-[#feecec] p-1.5">
            <div className="h-4 w-4 rounded-sm bg-[#f04747]" />
          </div>
          <span className="text-sm font-semibold text-[#1f2433]">
            Payment Distribution
          </span>
          <div className="ml-auto flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#1f2433]" />
              <span className="text-[#6b7280]">CASH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#f04747]" />
              <span className="text-[#6b7280]">QRIS</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 flex h-8 overflow-hidden rounded-full">
          <div
            className="bg-[#1f2433]"
            style={{ width: `${cashPercentage}%` }}
          />
          <div
            className="bg-[#f04747]"
            style={{ width: `${qrisPercentage}%` }}
          />
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1f2433]">
              Rp {cashRevenue.toLocaleString("id-ID")}
            </div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wider text-[#9aa2b1]">
              CASH TOTAL
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1f2433]">
              Rp {qrisRevenue.toLocaleString("id-ID")}
            </div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wider text-[#9aa2b1]">
              QRIS TOTAL
            </div>
          </div>
        </div>
      </div>

      {/* Daily Transactions */}
      <div className="rounded-2xl border border-[#e6eaf2] bg-white">
        <div className="flex items-center justify-between border-b border-[#eef1f6] px-5 py-4">
          <h2 className="text-base font-semibold text-[#1f2433]">
            Daily Transactions
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9aa2b1]">Show</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-[#e6eaf2] bg-white px-2 py-1 text-xs text-[#6b7280] focus:border-[#4f5bff] focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs text-[#9aa2b1]">per page</span>
            </div>
            <button className="text-xs text-[#9aa2b1] transition-colors hover:text-[#6b7280]">
              All Transactions
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[0.6fr_1.5fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-[#eef1f6] px-5 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa2b1]">
            TIME
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa2b1]">
            DESCRIPTION
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa2b1]">
            TYPE
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa2b1]">
            PAYMENT METHOD
          </div>
          <div className="text-right text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa2b1]">
            AMOUNT
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#eef1f6]">
          {isLoading ? (
            <div className="px-5 py-8 text-center text-xs text-[#9aa2b1]">
              Loading transactions...
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-[#9aa2b1]">
              No transactions found
            </div>
          ) : (
            paginatedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-[0.6fr_1.5fr_0.8fr_0.8fr_0.8fr] gap-4 px-5 py-4"
              >
                <div className="text-xs font-medium text-[#1f2433]">
                  {formatTime(transaction.occurredAt)}
                </div>
                <div>
                  <div className="text-xs font-medium text-[#1f2433]">
                    {transaction.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#9aa2b1]">
                    {transaction.id}
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      transaction.type === "Rental"
                        ? "bg-[#e6f0ff] text-[#3b82f6]"
                        : transaction.type === "Snack"
                          ? "bg-[#fff4d9] text-[#f59e0b]"
                          : "bg-[#feecec] text-[#f04747]"
                    }`}
                  >
                    {transaction.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                  {transaction.paymentMethod === "qris" ? (
                    <>
                      <QrCode className="h-3.5 w-3.5 text-[#f04747]" />
                      <span>QRIS</span>
                    </>
                  ) : transaction.paymentMethod === "cash" ? (
                    <>
                      <Banknote className="h-3.5 w-3.5 text-[#22c55e]" />
                      <span>Cash</span>
                    </>
                  ) : (
                    <span className="text-[#9aa2b1]">-</span>
                  )}
                </div>
                <div className="text-right text-xs font-semibold text-[#1f2433]">
                  Rp {Math.abs(transaction.amount).toLocaleString("id-ID")}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#eef1f6] px-5 py-4">
          <div className="text-xs text-[#9aa2b1]">
            Showing {startIndex + 1} to {Math.min(startIndex + perPage, allTransactions.length)} of {allTransactions.length} transactions
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6eaf2] bg-white text-xs text-[#6b7280] transition-colors hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${
                  currentPage === page
                    ? "border-[#4f5bff] bg-[#f3f5ff] text-[#4f5bff]"
                    : "border-[#e6eaf2] bg-white text-[#6b7280] hover:bg-[#f9fafb]"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6eaf2] bg-white text-xs text-[#6b7280] transition-colors hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
