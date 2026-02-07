import type { StationRuntime } from "../types";
import {
  getDurationParts,
  getElapsedMs,
  getOrdersSubtotal,
  getRemainingMs,
  getRentalCost,
  getTimedEndAt,
} from "../billing";
import {
  formatClock,
  formatClockWithSeconds,
  formatDuration,
  formatNumber,
  formatRupiah,
} from "../format";

type StopSessionModalProps = {
  station: StationRuntime | null;
  now: number;
  onClose: () => void;
  onStopAndCheckout: (stationId: number) => void;
};

export function StopSessionModal({
  station,
  now,
  onClose,
  onStopAndCheckout,
}: StopSessionModalProps) {
  if (!station || !station.session) {
    return null;
  }

  const session = station.session;
  const isTimed = session.mode === "timed";
  const isStopped = Boolean(session.stoppedAt);
  const elapsedMs = getElapsedMs(session, now);
  const remainingMs = getRemainingMs(session, now);
  const rentalCost = getRentalCost(session, now);
  const snackSubtotal = getOrdersSubtotal(station.orders);
  const total = rentalCost + snackSubtotal;
  const endAt = isTimed ? getTimedEndAt(session) : session.stoppedAt ?? now;
  const durationMinutes = session.durationMinutes ?? 0;
  const durationParts = getDurationParts(durationMinutes);

  const badge = isTimed ? "Timed Session" : "Open Bill";
  const badgeTone = "bg-[#e7f7ee] text-[#16a34a]";
  const timeLabel = isTimed && !isStopped ? "Remaining Time" : "Elapsed Time";
  const timeValue = isTimed && !isStopped
    ? `${formatDuration(remainingMs)} left`
    : formatDuration(elapsedMs);
  const subtotalNote =
    isTimed && durationMinutes > 0
      ? `Fixed ${durationParts.hours}h ${durationParts.minutes}m`
      : "";
  const note = isTimed
    ? `Auto-stop at ${formatClock(endAt)}. No refund for early stop.`
    : "Open bill is prorated per minute.";
  const actionLabel = isStopped ? "PROCEED TO CHECKOUT" : "STOP SESSION";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/55 px-4 py-8">
      <div className="w-full max-w-[940px] overflow-hidden rounded-2xl border border-[#e6eaf2] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.32)]">
        <div className="flex items-start justify-between px-6 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-[#1f2433]">
                Station {station.id} - Transaction Details
              </h2>
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeTone}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                {badge}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#8a93a5]">
              Order ID: #TRX-{station.id}-001 • Started by: Admin
            </p>
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
          <div className="grid gap-6 lg:grid-cols-[1.05fr_1.2fr]">
            <div>
              <div className="flex items-center justify-between border-b border-[#eef1f6] pb-2">
                <h3 className="text-sm font-semibold text-[#1f2433]">
                  Rental Information
                </h3>
              </div>
              <div className="mt-4 rounded-xl border border-[#eef1f6] bg-[#f8fafc] px-4 py-4">
                <div className="space-y-3 text-xs text-[#8a93a5]">
                  <div className="flex items-center justify-between">
                    <span>Start Time</span>
                    <span className="font-semibold text-[#1f2433]">
                      {formatClockWithSeconds(session.startAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{timeLabel}</span>
                    <span className="font-mono text-sm font-semibold text-[#f04747]">
                      {timeValue}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rate per Hour</span>
                    <span className="font-semibold text-[#1f2433]">
                      {formatRupiah(session.ratePerHour)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#eef1f6] pt-3">
                    <span className="font-semibold text-[#1f2433]">
                      Rental Subtotal
                    </span>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-[#1f2433]">
                        {formatRupiah(rentalCost)}
                      </div>
                      {subtotalNote ? (
                        <p className="text-[10px] text-[#9aa2b1]">
                          {subtotalNote}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#dbeafe] bg-[#f1f7ff] px-4 py-3 text-xs text-[#4f6fd9]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e0edff] text-[11px] font-semibold text-[#3b82f6]">
                  i
                </span>
                <div>
                  <p className="font-semibold">Note:</p>
                  <p className="mt-1">{note}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between border-b border-[#eef1f6] pb-2">
                <h3 className="text-sm font-semibold text-[#1f2433]">
                  Snack & Drink Orders
                </h3>
                <span className="text-xs font-semibold text-[#f04747]">
                  Subtotal: {formatRupiah(snackSubtotal)}
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-[#eef1f6] bg-white">
                <div className="grid grid-cols-[1.4fr_0.6fr_0.6fr_0.7fr] gap-2 border-b border-[#eef1f6] px-4 py-2 text-[11px] font-semibold text-[#8a93a5]">
                  <span>Item</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">Total</span>
                </div>
                {station.orders.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-[#9aa2b1]">
                    No orders recorded yet.
                  </div>
                ) : (
                  station.orders.map((order, index) => (
                    <div
                      key={order.name}
                      className={`grid grid-cols-[1.4fr_0.6fr_0.6fr_0.7fr] items-center gap-2 px-4 py-2 text-xs text-[#6b7280] ${
                        index !== station.orders.length - 1
                          ? "border-b border-[#eef1f6]"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-semibold text-white ${order.tone}`}
                        >
                          {order.name[0]}
                        </span>
                        <span className="max-w-[110px] text-xs font-semibold text-[#1f2433] leading-tight">
                          {order.name}
                        </span>
                      </div>
                      <div className="text-center font-semibold text-[#1f2433]">
                        {order.qty}
                      </div>
                      <span className="text-right">
                        {formatNumber(order.price)}
                      </span>
                      <span className="text-right font-semibold text-[#1f2433]">
                        {formatNumber(order.price * order.qty)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#eef1f6] px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#9aa2b1]">
              Total Keseluruhan
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#1f2433]">
              {formatRupiah(total)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-[#e6eaf2] bg-white px-4 py-2 text-xs font-semibold text-[#6b7280]"
            >
              Close
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-[#2f6fff] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(47,111,255,0.25)]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4.5 6H11.5V3.5H4.5V6Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 10.5H11"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <path
                  d="M3 6V12.5H13V6"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
              Print Bill
            </button>
            <button
              onClick={() => onStopAndCheckout(station.id)}
              className="flex items-center gap-2 rounded-lg bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(240,71,71,0.25)]"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white">
                <span className="h-2 w-2 rounded-sm bg-white" />
              </span>
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
