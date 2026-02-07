"use client";

import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api/client";
import { formatRupiah } from "../dashboard/_components/format";

type Transaction = {
  id: string;
  name: string;
  notes: string;
  occurredAt: string;
  employeeName: string | null;
  amount: number;
};

type TransactionRow = {
  id: string;
  name: string;
  notes: string;
  date: string;
  time: string;
  employee: string;
  amount: string;
  amountTone: string;
};

type SnackOption = {
  id: string;
  name: string;
  stockOnHand: number;
};

type SnackApi = {
  id: string;
  name: string;
  stockOnHand: string;
  isActive: boolean;
};

type TransactionKind = "inventory" | "expense";

type TransactionForm = {
  kind: TransactionKind;
  snackId: string;
  qty: string;
  description: string;
  amount: string;
  notes: string;
  occurredAt: string;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toLocalInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const buildDefaultForm = (snacks: SnackOption[]): TransactionForm => ({
  kind: snacks.length ? "inventory" : "expense",
  snackId: snacks[0]?.id ?? "",
  qty: "",
  description: "",
  amount: "",
  notes: "",
  occurredAt: toLocalInputValue(new Date()),
});

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [snacks, setSnacks] = useState<SnackOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<TransactionForm>(() =>
    buildDefaultForm([])
  );

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [transactionResult, snackResult] = await Promise.allSettled([
          apiFetch<Transaction[]>("/api/transactions"),
          apiFetch<SnackApi[]>("/api/snacks"),
        ]);

        if (!isMounted) return;

        if (transactionResult.status === "fulfilled") {
          setTransactions(transactionResult.value);
        } else {
          throw transactionResult.reason;
        }

        if (snackResult.status === "fulfilled") {
          const activeSnacks = snackResult.value
            .filter((snack) => snack.isActive)
            .map((snack) => ({
              id: snack.id,
              name: snack.name,
              stockOnHand: Number(snack.stockOnHand),
            }));
          setSnacks(activeSnacks);
          setForm(buildDefaultForm(activeSnacks));
        } else {
          setSnacks([]);
        }
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

  const rows = useMemo<TransactionRow[]>(() => {
    return transactions.map((entry) => {
      const isExpense = entry.amount < 0;
      const amountValue = formatRupiah(Math.abs(entry.amount));
      return {
        id: entry.id,
        name: entry.name,
        notes: entry.notes,
        date: formatDate(entry.occurredAt),
        time: formatTime(entry.occurredAt),
        employee: entry.employeeName ?? "System",
        amount: isExpense ? `- ${amountValue}` : amountValue,
        amountTone: isExpense ? "text-[#f04747]" : "text-[#22c55e]",
      };
    });
  }, [transactions]);

  const resetModal = () => {
    setModalOpen(false);
    setFormError(null);
    setForm(buildDefaultForm(snacks));
  };

  const openModal = () => {
    setForm(buildDefaultForm(snacks));
    setFormError(null);
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!form.description.trim()) {
      return "Description is required.";
    }
    if (!form.amount.trim()) {
      return "Amount is required.";
    }
    const amountValue = Number(form.amount.replace(/[^\d.-]/g, ""));
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return "Amount must be a positive number.";
    }
    if (!form.notes.trim()) {
      return "Notes are required.";
    }
    if (!form.occurredAt) {
      return "Date is required.";
    }
    if (form.kind === "inventory") {
      if (!form.snackId) {
        return "Snack is required for inventory transactions.";
      }
      const qtyValue = Number(form.qty.replace(/[^\d]/g, ""));
      if (!Number.isFinite(qtyValue) || qtyValue <= 0) {
        return "Quantity must be a positive number.";
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = {
        kind: form.kind,
        snackId: form.kind === "inventory" ? form.snackId : undefined,
        qty:
          form.kind === "inventory"
            ? Number(form.qty.replace(/[^\d]/g, ""))
            : undefined,
        description: form.description.trim(),
        amount: Number(form.amount.replace(/[^\d.-]/g, "")),
        notes: form.notes.trim(),
        occurredAt: new Date(form.occurredAt).toISOString(),
      };

      const created = await apiFetch<Transaction>("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setTransactions((prev) => [created, ...prev]);
      if (form.kind === "inventory") {
        setSnacks((prev) =>
          prev.map((snack) =>
            snack.id === form.snackId
              ? {
                  ...snack,
                  stockOnHand:
                    snack.stockOnHand +
                    Number(form.qty.replace(/[^\d]/g, "")),
                }
              : snack
          )
        );
      }
      resetModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#1f2433]">
            Transaction History
          </h1>
          <p className="text-xs text-[#8a93a5]">
            Track inventory additions and operational expenses in one place.
          </p>
        </div>
        <button
          onClick={openModal}
          className="rounded-lg bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_18px_rgba(240,71,71,0.25)]"
        >
          Add Transaction
        </button>
      </header>

      {loadError ? (
        <div className="rounded-xl border border-[#f8caca] bg-[#feecec] px-4 py-3 text-xs text-[#f04747]">
          {loadError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-[#e6eaf2] bg-white px-4 py-4 text-xs text-[#9aa2b1]">
          Loading transactions...
        </div>
      ) : null}

      <section className="rounded-2xl border border-[#e6eaf2] bg-white">
        <div className="flex items-center justify-between border-b border-[#eef1f6] px-5 py-4">
          <p className="text-sm font-semibold text-[#1f2433]">
            All Transactions
          </p>
          <span className="text-xs text-[#9aa2b1]">
            {rows.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[1.1fr_1.8fr_1.1fr_1.1fr_0.9fr_1.6fr] gap-4 border-b border-[#eef1f6] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa2b1]">
              <span>ID</span>
              <span>Transaction Name</span>
              <span>Time</span>
              <span>Employee</span>
              <span>Value</span>
              <span>Notes</span>
            </div>
            <div className="divide-y divide-[#eef1f6]">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1.1fr_1.8fr_1.1fr_1.1fr_0.9fr_1.6fr] gap-4 px-5 py-3 text-xs text-[#6b7280]"
                >
                  <span className="truncate font-mono text-[11px] text-[#9aa2b1]">
                    {row.id}
                  </span>
                  <span className="text-sm text-[#374151]">{row.name}</span>
                  <div>
                    <p className="text-sm text-[#4b5563]">{row.date}</p>
                    <p className="text-[11px] text-[#9aa2b1]">{row.time}</p>
                  </div>
                  <span className="text-sm text-[#4b5563]">
                    {row.employee}
                  </span>
                  <span className={`text-sm font-semibold ${row.amountTone}`}>
                    {row.amount}
                  </span>
                  <span className="text-sm text-[#4b5563]">{row.notes}</span>
                </div>
              ))}
              {!isLoading && rows.length === 0 ? (
                <div className="px-5 py-6 text-center text-xs text-[#9aa2b1]">
                  No transactions recorded yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/55 px-4 py-8">
          <div className="w-full max-w-[680px] overflow-hidden rounded-xl border border-[#e6eaf2] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.32)]">
            <div className="flex items-center justify-between border-b border-[#eef1f6] px-7 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ffecec] text-[#f04747]">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 10.2L9.9 2.8L12.7 5.6L5.3 13H2.5V10.2Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h2 className="text-sm font-semibold text-[#1f2433]">
                  Add Transaction
                </h2>
              </div>
              <button
                onClick={resetModal}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] text-[#9aa2b1]"
                aria-label="Close modal"
              >
                X
              </button>
            </div>

            <div className="space-y-3.5 px-7 py-5">
              {formError && (
                <div className="rounded-md border border-[#feecec] bg-[#fff5f5] px-4 py-2 text-xs text-[#f04747]">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                  Transaction Type
                  <select
                    value={form.kind}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        kind: event.target.value as TransactionKind,
                      }))
                    }
                    className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none"
                  >
                    <option value="inventory">Inventory (Snack)</option>
                    <option value="expense">Other Expense</option>
                  </select>
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                  Date & Time
                  <input
                    type="datetime-local"
                    value={form.occurredAt}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        occurredAt: event.target.value,
                      }))
                    }
                    className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none"
                  />
                </label>
              </div>

              {form.kind === "inventory" ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                    Snack Item
                    <select
                      value={form.snackId}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          snackId: event.target.value,
                        }))
                      }
                      className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none"
                    >
                      {snacks.length === 0 ? (
                        <option value="">No snacks available</option>
                      ) : (
                        snacks.map((snack) => (
                          <option key={snack.id} value={snack.id}>
                            {snack.name} (Stock: {snack.stockOnHand})
                          </option>
                        ))
                      )}
                    </select>
                  </label>
                  <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                    Quantity Added
                    <input
                      value={form.qty}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          qty: event.target.value,
                        }))
                      }
                      className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none"
                      placeholder="10"
                    />
                  </label>
                </div>
              ) : null}

              <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                Description
                <input
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none"
                  placeholder="Inventory restock for weekend"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                  Amount (IDR)
                  <input
                    value={form.amount}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        amount: event.target.value,
                      }))
                    }
                    className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none"
                    placeholder="150000"
                  />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                  Notes
                  <input
                    value={form.notes}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        notes: event.target.value,
                      }))
                    }
                    className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none"
                    placeholder="Supplier: CV Nusantara"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={resetModal}
                  className="rounded-md border border-[#e6eaf2] px-4 py-2 text-xs font-semibold text-[#6b7280]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`rounded-md px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.3)] ${
                    isSubmitting ? "bg-[#f6a0a0]" : "bg-[#f04747]"
                  }`}
                >
                  {isSubmitting ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
