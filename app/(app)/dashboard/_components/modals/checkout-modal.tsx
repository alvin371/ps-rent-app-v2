import type { PaymentMethod, StationRuntime } from "../types";
import {
  getElapsedMs,
  getOrdersSubtotal,
  getRentalCost,
} from "../billing";
import { formatDuration, formatRupiah } from "../format";

type CheckoutModalProps = {
  station: StationRuntime | null;
  now: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onCompletePayment: (stationId: number) => void;
  onClose: () => void;
};

export function CheckoutModal({
  station,
  now,
  paymentMethod,
  onPaymentMethodChange,
  onCompletePayment,
  onClose,
}: CheckoutModalProps) {
  if (!station || !station.session) {
    return null;
  }

  const session = station.session;
  const durationMs = getElapsedMs(session, now);
  const rentalCost = getRentalCost(session, now, station.model);
  const snackTotal = getOrdersSubtotal(station.orders);
  const grandTotal = rentalCost + snackTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/55 px-4 py-8">
      <div className="w-full max-w-[760px] overflow-hidden rounded-2xl border border-[#e6eaf2] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.32)]">
        <div className="flex items-start justify-between px-6 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffecec] text-[#f04747]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4 6.5H16"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M6 4L10 2L14 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 9.5C6 12 8 14 10 14C12 14 14 12 14 9.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M4.5 16H15.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-[#1f2433]">
                  Checkout & Payment
                </h2>
                <span className="rounded-full bg-[#f1f3f8] px-2 py-0.5 text-[10px] font-semibold text-[#8a93a5]">
                  Station {station.id}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e6eaf2] text-[#9aa2b1]"
            aria-label="Close modal"
          >
            x
          </button>
        </div>

        <div className="border-t border-[#eef1f6] px-6 py-5">
          <div className="grid gap-6 md:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9aa2b1]">
                Final Summary
              </p>
              <div className="mt-4 space-y-3 text-xs text-[#8a93a5]">
                <div className="flex items-center justify-between">
                  <span>Total Duration</span>
                  <span className="font-mono text-sm font-semibold text-[#1f2433]">
                    {formatDuration(durationMs)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rental Cost</span>
                  <span className="text-sm font-semibold text-[#1f2433]">
                    {formatRupiah(rentalCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Snack Total</span>
                  <span className="text-sm font-semibold text-[#1f2433]">
                    {formatRupiah(snackTotal)}
                  </span>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-[#f5c5c5] bg-[#fff5f5] px-4 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#f04747]">
                  Grand Total
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#1f2433]">
                  {formatRupiah(grandTotal)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9aa2b1]">
                Payment Method
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <button
                  onClick={() => onPaymentMethodChange("cash")}
                  className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold ${
                    paymentMethod === "cash"
                      ? "border-[#f04747] bg-[#fff5f5] text-[#f04747] shadow-[0_8px_20px_rgba(240,71,71,0.15)]"
                      : "border-[#e6eaf2] text-[#6b7280]"
                  }`}
                >
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#f04747] shadow-[0_4px_10px_rgba(15,23,42,0.08)]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="10"
                        height="8"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M5 8H11"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  Cash
                </button>
                <button
                  onClick={() => onPaymentMethodChange("qris")}
                  className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold ${
                    paymentMethod === "qris"
                      ? "border-[#f04747] bg-[#fff5f5] text-[#f04747] shadow-[0_8px_20px_rgba(240,71,71,0.15)]"
                      : "border-[#e6eaf2] text-[#6b7280]"
                  }`}
                >
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#6b7280] shadow-[0_4px_10px_rgba(15,23,42,0.08)]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 3H7V7H3V3Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M9 3H13V7H9V3Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M3 9H7V13H3V9Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M9 9H13V13H9V9Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </div>
                  QRIS / Wallet
                </button>
                <button
                  onClick={() => onPaymentMethodChange("debt")}
                  className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold ${
                    paymentMethod === "debt"
                      ? "border-[#f04747] bg-[#fff5f5] text-[#f04747] shadow-[0_8px_20px_rgba(240,71,71,0.15)]"
                      : "border-[#e6eaf2] text-[#6b7280]"
                  }`}
                >
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#6b7280] shadow-[0_4px_10px_rgba(15,23,42,0.08)]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <rect
                        x="2.5"
                        y="4"
                        width="11"
                        height="8"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M3.5 7.5H12.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  Debt/Utang
                </button>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-[#6b7280]">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add additional notes about transaction..."
                  className="mt-2 w-full rounded-lg border border-[#e6eaf2] bg-white px-3 py-2 text-xs text-[#6b7280] outline-none placeholder:text-[#b7becb]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#eef1f6] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#e6eaf2] bg-white px-4 py-2 text-xs font-semibold text-[#6b7280]"
          >
            Cancel
          </button>
          <button
            onClick={() => onCompletePayment(station.id)}
            className="flex items-center gap-2 rounded-lg bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(240,71,71,0.3)]"
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
                d="M3.5 8.5L6.5 11.5L12.5 5.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Complete Payment & Stop Session
          </button>
        </div>
      </div>
    </div>
  );
}
