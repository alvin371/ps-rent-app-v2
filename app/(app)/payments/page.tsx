"use client";

import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api/client";

type PaymentStatus = "Paid" | "Pending" | "Failed";

type Payment = {
  id: string;
  name: string;
  status: PaymentStatus;
};

type ModalMode = "create" | "edit" | "view" | "delete" | null;

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState<Payment>({
    id: "",
    name: "",
    status: "Pending",
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await apiFetch<Payment[]>("/api/payments");
        if (!isMounted) return;
        setPayments(data);
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

  const activePayment = useMemo(
    () => payments.find((payment) => payment.id === activeId) ?? null,
    [activeId, payments]
  );

  const statusToneMap: Record<PaymentStatus, string> = {
    Paid: "bg-[#e7f7ee] text-[#22c55e]",
    Pending: "bg-[#fff4d9] text-[#f59e0b]",
    Failed: "bg-[#feecec] text-[#f04747]",
  };

  const statusOptions: PaymentStatus[] = ["Paid", "Pending", "Failed"];

  const getNextId = () => {
    const max = payments.reduce((acc, payment) => {
      const match = payment.id.match(/\d+/g);
      const value = match ? Number(match.join("")) : 0;
      return value > acc ? value : acc;
    }, 0);
    return `PAY-${String(max + 1).padStart(3, "0")}`;
  };

  const resetModal = () => {
    setModalMode(null);
    setActiveId(null);
    setFormError(null);
  };

  const openCreate = () => {
    setForm({
      id: "",
      name: "",
      status: "Pending",
    });
    setFormError(null);
    setModalMode("create");
  };

  const openView = (payment: Payment) => {
    setActiveId(payment.id);
    setForm({ ...payment });
    setFormError(null);
    setModalMode("view");
  };

  const openEdit = (payment: Payment) => {
    setActiveId(payment.id);
    setForm({ ...payment });
    setFormError(null);
    setModalMode("edit");
  };

  const openDelete = (payment: Payment) => {
    setActiveId(payment.id);
    setFormError(null);
    setModalMode("delete");
  };

  const handleCreate = async () => {
    const trimmedName = form.name.trim();
    const trimmedId = form.id.trim();
    const computedId = trimmedId || getNextId();
    if (!trimmedName) {
      setFormError("Payment name is required.");
      return;
    }
    if (payments.some((payment) => payment.id === computedId)) {
      setFormError("Payment ID already exists.");
      return;
    }
    const payload = {
      ...form,
      id: computedId,
      name: trimmedName,
    };
    try {
      const created = await apiFetch<Payment>("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setPayments((prev) => [created, ...prev]);
      resetModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create");
    }
  };

  const handleUpdate = async () => {
    if (!activePayment) return;
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setFormError("Payment name is required.");
      return;
    }
    const { id: _id, ...rest } = form;
    const payload = {
      ...rest,
      name: trimmedName,
    };
    try {
      const updated = await apiFetch<Payment>(
        `/api/payments/${activePayment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      setPayments((prev) =>
        prev.map((payment) => (payment.id === updated.id ? updated : payment))
      );
      resetModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!activePayment) return;
    try {
      await apiFetch(`/api/payments/${activePayment.id}`, { method: "DELETE" });
      setPayments((prev) =>
        prev.filter((payment) => payment.id !== activePayment.id)
      );
      resetModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#1f2433]">
            Payment Management
          </h1>
          <p className="text-xs text-[#8a93a5]">
            Track deposits, invoices, and payment status
          </p>
        </div>
        <div className="flex items-center gap-3">
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
        <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-[#e6eaf2] bg-white px-3 py-2 text-xs text-[#9aa2b1]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="4.5" stroke="#9aa2b1" strokeWidth="1.2" />
            <path d="M9.5 9.5L12.2 12.2" stroke="#9aa2b1" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            className="w-full bg-transparent text-xs text-[#6b7280] outline-none placeholder:text-[#c0c6d4]"
            placeholder="Search payment by ID or name..."
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.3)]"
        >
          <span className="text-base leading-none">+</span>
          Add New Payment
        </button>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-[#f8caca] bg-[#feecec] px-4 py-3 text-xs text-[#f04747]">
          {loadError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-[#e6eaf2] bg-white px-4 py-4 text-xs text-[#9aa2b1]">
          Loading payments...
        </div>
      ) : null}

      <section className="rounded-2xl border border-[#e6eaf2] bg-white">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.6fr] gap-4 border-b border-[#eef1f6] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9aa2b1]">
          <span>Payment Name</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-[#eef1f6]">
          {payments.map((payment, index) => (
            <div
              key={payment.id}
              className="grid grid-cols-[1.4fr_0.8fr_0.6fr] gap-4 px-5 py-4 text-xs text-[#6b7280]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                    index % 2 === 0
                      ? "bg-[#eef3ff] text-[#4f5bff]"
                      : "bg-[#feecec] text-[#f04747]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1f2433]">
                    {payment.name}
                  </p>
                  <p className="text-[11px] text-[#9aa2b1]">
                    ID: {payment.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span
                  className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusToneMap[payment.status]}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {payment.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#4f5bff]">
                <button
                  onClick={() => openEdit(payment)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] bg-white"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 9.6L9.6 3L11 4.4L4.4 11H3V9.6Z"
                      stroke="#4f5bff"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => openView(payment)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] bg-white text-[#9aa2b1]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="4.5"
                      stroke="#9aa2b1"
                      strokeWidth="1.2"
                    />
                    <circle cx="7" cy="7" r="1.5" fill="#9aa2b1" />
                  </svg>
                </button>
                <button
                  onClick={() => openDelete(payment)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] bg-white text-[#9aa2b1]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 1.5V7M10 3.5C11.2 4.6 12 6.2 12 8C12 10.5 9.8 12.5 7 12.5C4.2 12.5 2 10.5 2 8C2 6.2 2.8 4.6 4 3.5"
                      stroke="#9aa2b1"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-xs text-[#9aa2b1]">
          <span>
            Showing {payments.length ? 1 : 0} to {payments.length} of{" "}
            {payments.length} results
          </span>
          <div className="flex items-center overflow-hidden rounded-lg border border-[#e6eaf2] bg-white text-xs">
            <button className="flex h-8 w-8 items-center justify-center text-[#9aa2b1]">
              ‹
            </button>
            {["1", "2", "3"].map((page) => (
              <button
                key={page}
                className={`flex h-8 w-8 items-center justify-center ${
                  page === "1"
                    ? "bg-[#f3f5ff] text-[#4f5bff]"
                    : "text-[#9aa2b1]"
                }`}
              >
                {page}
              </button>
            ))}
            <button className="flex h-8 w-8 items-center justify-center text-[#9aa2b1]">
              ›
            </button>
          </div>
        </div>
      </section>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/55 px-4 py-8">
          <div className="w-full max-w-[640px] overflow-hidden rounded-xl border border-[#e6eaf2] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.32)]">
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
                  {modalMode === "create"
                    ? "Add Payment"
                    : modalMode === "edit"
                      ? "Edit Payment"
                      : modalMode === "view"
                        ? "Payment Details"
                        : "Delete Payment"}
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

            {modalMode === "delete" ? (
              <div className="space-y-6 px-6 py-6">
                <p className="text-sm text-[#6b7280]">
                  This will permanently remove the payment record.
                  <span className="text-[#1f2433]"> ID: {activePayment?.id}</span>
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={resetModal}
                    className="rounded-md border border-[#e6eaf2] px-4 py-2 text-xs font-semibold text-[#6b7280]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded-md bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.3)]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3.5 px-7 py-4">
                  {formError && (
                    <div className="rounded-md border border-[#feecec] bg-[#fff5f5] px-4 py-2 text-xs text-[#f04747]">
                      {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                      Payment Name
                      <input
                        value={form.name}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        disabled={modalMode === "view"}
                        className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none placeholder:text-[#c0c6d4] disabled:cursor-not-allowed disabled:bg-[#f6f7fb] disabled:text-[#9aa2b1]"
                        placeholder="Northgate Arcade"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-semibold text-[#6b7280]">
                      Payment ID
                      <input
                        value={form.id}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            id: event.target.value,
                          }))
                        }
                        disabled={modalMode !== "create"}
                        className="h-9 w-full rounded-md border border-[#e1e6ef] bg-white px-3 text-sm text-[#1f2433] outline-none placeholder:text-[#c0c6d4] disabled:cursor-not-allowed disabled:bg-[#f6f7fb] disabled:text-[#9aa2b1]"
                        placeholder="PAY-004"
                      />
                    </label>
                  </div>

                  <div className="border-t border-[#eef1f6] pt-3.5">
                    <p className="text-xs font-semibold text-[#6b7280]">
                      Payment Status
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-5 text-xs text-[#6b7280]">
                      {statusOptions.map((status) => {
                        const isSelected = form.status === status;
                        const tone =
                          status === "Paid"
                            ? "text-[#22c55e] border-[#22c55e]"
                            : status === "Pending"
                              ? "text-[#f59e0b] border-[#f59e0b]"
                              : "text-[#f04747] border-[#f04747]";
                        return (
                          <label
                            key={status}
                            className={`flex items-center gap-2 ${
                              modalMode === "view"
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment-status"
                              value={status}
                              checked={isSelected}
                              onChange={(event) =>
                                setForm((prev) => ({
                                  ...prev,
                                  status: event.target.value as PaymentStatus,
                                }))
                              }
                              disabled={modalMode === "view"}
                              className="sr-only"
                            />
                            <span
                              className={`flex h-3 w-3 items-center justify-center rounded-full border ${
                                isSelected
                                  ? tone
                                  : "border-[#d7dbe5] text-[#d7dbe5]"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isSelected ? "bg-current" : "bg-transparent"
                                }`}
                              />
                            </span>
                            {status}
                          </label>
                        );
                      })}
                    </div>
                    <div className="mt-2.5 rounded-md border border-[#ffe1a6] bg-[#fff7e6] px-3 py-2 text-[11px] text-[#f59e0b]">
                      <span className="font-semibold">Note:</span> Pending
                      payments are still awaiting settlement.
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#eef1f6] px-7 py-4">
                  {modalMode !== "create" ? (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 rounded-md bg-[#fff1f1] px-3 py-2 text-xs font-semibold text-[#f04747]"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.5 3.5H9.5M4.5 3.5V2.5C4.5 2.22 4.72 2 5 2H7C7.28 2 7.5 2.22 7.5 2.5V3.5M4.5 5.5V8.5M7.5 5.5V8.5M3.5 3.5L4 9.5C4 9.78 4.22 10 4.5 10H7.5C7.78 10 8 9.78 8 9.5L8.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Delete Payment
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetModal}
                      className="rounded-md border border-[#e6eaf2] px-4 py-2 text-xs font-semibold text-[#6b7280]"
                    >
                      Cancel
                    </button>
                    {modalMode === "create" && (
                      <button
                        onClick={handleCreate}
                        className="rounded-md bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.3)]"
                      >
                        Add Payment
                      </button>
                    )}
                    {modalMode === "edit" && (
                      <button
                        onClick={handleUpdate}
                        className="rounded-md bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.3)]"
                      >
                        Update Changes
                      </button>
                    )}
                    {modalMode === "view" && (
                      <button
                        onClick={() => activePayment && openEdit(activePayment)}
                        className="rounded-md bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.3)]"
                      >
                        Edit Payment
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
