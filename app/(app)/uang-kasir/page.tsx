"use client";

import { useEffect, useState } from "react";
import { Save, Info } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

type Denomination = {
  label: string;
  value: number;
  color: string;
};

const denominations: Denomination[] = [
  { label: "100k", value: 100000, color: "bg-[#fecaca] text-[#991b1b]" },
  { label: "75k", value: 75000, color: "bg-[#fca5a5] text-[#991b1b]" },
  { label: "50k", value: 50000, color: "bg-[#bfdbfe] text-[#1e40af]" },
  { label: "20k", value: 20000, color: "bg-[#bbf7d0] text-[#166534]" },
  { label: "10k", value: 10000, color: "bg-[#e9d5ff] text-[#6b21a8]" },
  { label: "5k", value: 5000, color: "bg-[#fef08a] text-[#854d0e]" },
  { label: "2k", value: 2000, color: "bg-[#e5e7eb] text-[#374151]" },
  { label: "1k", value: 1000, color: "bg-[#f3f4f6] text-[#6b7280]" },
  { label: "COIN", value: 500, color: "bg-[#fed7aa] text-[#9a3412]" },
  { label: "COIN", value: 200, color: "bg-[#e5e7eb] text-[#6b7280]" },
  { label: "COIN", value: 100, color: "bg-[#e5e7eb] text-[#6b7280]" },
];

export default function UangKasirPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const [counts, setCounts] = useState<Record<number, number | "">>({
    100000: "",
    75000: "",
    50000: "",
    20000: "",
    10000: "",
    5000: "",
    2000: "",
    1000: "",
    500: "",
    200: "",
    100: "",
  });

  const [totalSales, setTotalSales] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch<{
          cashDrawer: any;
          totalSales: number;
          expenses: number;
        }>(`/api/cash-drawer?date=${selectedDate}`);

        setTotalSales(data.totalSales);
        setExpenses(data.expenses);

        if (data.cashDrawer) {
          setCounts({
            100000: data.cashDrawer.denom100k,
            75000: data.cashDrawer.denom75k,
            50000: data.cashDrawer.denom50k,
            20000: data.cashDrawer.denom20k,
            10000: data.cashDrawer.denom10k,
            5000: data.cashDrawer.denom5k,
            2000: data.cashDrawer.denom2k,
            1000: data.cashDrawer.denom1k,
            500: data.cashDrawer.denom500,
            200: data.cashDrawer.denom200,
            100: data.cashDrawer.denom100,
          });
          setLastUpdated(new Date(data.cashDrawer.updatedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }));
        } else {
          setCounts({
            100000: "",
            75000: "",
            50000: "",
            20000: "",
            10000: "",
            5000: "",
            2000: "",
            1000: "",
            500: "",
            200: "",
            100: "",
          });
          setLastUpdated(null);
        }
      } catch (error) {
        console.error("Failed to load cash drawer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  const totalInDrawer = denominations.reduce(
    (sum, denom) => sum + denom.value * (typeof counts[denom.value] === "number" ? counts[denom.value] : 0),
    0
  );

  const expectedCash = totalInDrawer + totalSales - expenses;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiFetch("/api/cash-drawer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          startingBalance: 0,
          denom100k: typeof counts[100000] === "number" ? counts[100000] : 0,
          denom75k: typeof counts[75000] === "number" ? counts[75000] : 0,
          denom50k: typeof counts[50000] === "number" ? counts[50000] : 0,
          denom20k: typeof counts[20000] === "number" ? counts[20000] : 0,
          denom10k: typeof counts[10000] === "number" ? counts[10000] : 0,
          denom5k: typeof counts[5000] === "number" ? counts[5000] : 0,
          denom2k: typeof counts[2000] === "number" ? counts[2000] : 0,
          denom1k: typeof counts[1000] === "number" ? counts[1000] : 0,
          denom500: typeof counts[500] === "number" ? counts[500] : 0,
          denom200: typeof counts[200] === "number" ? counts[200] : 0,
          denom100: typeof counts[100] === "number" ? counts[100] : 0,
        }),
      });

      const now = new Date();
      setLastUpdated(now.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }));
    } catch (error: any) {
      alert(error.message || "Failed to save cash drawer");
    } finally {
      setIsSaving(false);
    }
  };

  const updateCount = (value: number, count: number | "") => {
    setCounts((prev) => ({ ...prev, [value]: count === "" ? "" : Math.max(0, count) }));
  };

  const isToday = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;
    return selectedDate === todayStr;
  })();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2433]">Uang Kasir</h1>
          <p className="text-sm text-[#9aa2b1]">
            Manage and track physical cash drawer denominations
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-lg border border-[#e6eaf2] bg-white px-4 py-2 text-sm text-[#6b7280] focus:border-[#4f5bff] focus:outline-none"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Cash Denominations */}
          <div className="rounded-2xl border border-[#e6eaf2] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1f2433]">
                Cash Denominations
              </h2>
              <span className="text-xs font-medium uppercase tracking-wider text-[#9aa2b1]">
                INDONESIAN RUPIAH (IDR)
              </span>
            </div>

            <div className="space-y-3">
              {denominations.map((denom) => (
                <div
                  key={denom.value}
                  className="flex items-center gap-4"
                >
                  <div
                    className={`flex h-10 w-16 items-center justify-center rounded-lg text-xs font-bold ${denom.color}`}
                  >
                    {denom.label}
                  </div>
                  <div className="text-sm font-medium text-[#1f2433]">
                    {denom.value.toLocaleString("id-ID")}
                  </div>
                  <span className="text-sm text-[#9aa2b1]">×</span>
                  <input
                    type="number"
                    min="0"
                    value={counts[denom.value]}
                    onChange={(e) =>
                      updateCount(denom.value, e.target.value === "" ? "" : parseInt(e.target.value))
                    }
                    onFocus={(e) => e.target.select()}
                    disabled={!isToday}
                    className="w-24 rounded-lg border border-[#e6eaf2] bg-white px-3 py-2 text-center text-sm text-[#1f2433] focus:border-[#4f5bff] focus:outline-none disabled:bg-[#f9fafb] disabled:text-[#9aa2b1]"
                  />
                  <span className="text-sm text-[#9aa2b1]">=</span>
                  <div className="flex-1 text-right text-sm font-semibold text-[#1f2433]">
                    Rp {(denom.value * counts[denom.value]).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Total Cash in Drawer */}
          <div className="rounded-2xl border border-[#e6eaf2] bg-white p-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9aa2b1]">
              TOTAL CASH IN DRAWER
            </h3>
            <div className="mb-4 text-3xl font-bold text-[#1f2433]">
              Rp {totalInDrawer.toLocaleString("id-ID")}
            </div>
            {lastUpdated && (
              <p className="text-xs text-[#9aa2b1]">
                Last updated: {lastUpdated}
              </p>
            )}
            <button
              onClick={handleSave}
              disabled={!isToday || isSaving}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f04747] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#dc3545] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Record"}
            </button>
          </div>

          {/* Shift Summary */}
          <div className="rounded-2xl border border-[#e6eaf2] bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#feecec]">
                <Info className="h-4 w-4 text-[#f04747]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1f2433]">
                Shift Summary
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b7280]">Total Sales (Cash)</span>
                <span className="font-semibold text-[#22c55e]">
                  Rp {totalSales.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b7280]">Expenses</span>
                <span className="font-semibold text-[#f04747]">
                  Rp {expenses.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="border-t border-[#eef1f6] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1f2433]">
                    Expected Cash
                  </span>
                  <span className="text-lg font-bold text-[#1f2433]">
                    Rp {expectedCash.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Help Box */}
          <div className="rounded-2xl border border-[#e0e7ff] bg-[#eef2ff] p-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4f5bff] text-white">
                <span className="text-xs font-bold">?</span>
              </div>
              <h3 className="text-sm font-semibold text-[#1f2433]">
                Need help?
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-[#6b7280]">
              Make sure to count all loose coins and small bills separately before entering the quantities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
