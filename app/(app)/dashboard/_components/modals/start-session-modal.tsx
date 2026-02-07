import type { SessionMode } from "../types";
import { formatRupiah } from "../format";

type StartSessionModalProps = {
  stationId: number | null;
  ratePerHour: number;
  sessionMode: SessionMode;
  onSessionModeChange: (mode: SessionMode) => void;
  durationHours: number;
  onDurationChange: (nextValue: number) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function StartSessionModal({
  stationId,
  ratePerHour,
  sessionMode,
  onSessionModeChange,
  durationHours,
  onDurationChange,
  onConfirm,
  onClose,
}: StartSessionModalProps) {
  if (stationId === null) {
    return null;
  }

  const durationPercent = ((durationHours - 1) / 23) * 100;
  const totalEstimate = durationHours * ratePerHour;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/55 px-4 py-8">
      <div className="w-full max-w-[760px] rounded-2xl border border-[#e6eaf2] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.32)]">
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22c55e]">
              <svg
                width="9"
                height="9"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 2.3C3 1.9 3.4 1.66 3.72 1.86L7.9 4.56C8.2 4.76 8.2 5.24 7.9 5.44L3.72 8.14C3.4 8.34 3 8.1 3 7.7V2.3Z"
                  fill="white"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-sm font-semibold text-[#1f2433]">
                Start Rental Session
              </h2>
              <p className="text-xs text-[#8a93a5]">
                Configure session for Station {stationId}
              </p>
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

        <div className="px-6 pb-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onSessionModeChange("open")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSessionModeChange("open");
                }
              }}
              className={`flex h-full flex-col rounded-2xl border p-4 text-left transition ${
                sessionMode === "open"
                  ? "border-[#14b87a] shadow-[0_10px_24px_rgba(20,184,122,0.2)]"
                  : "border-[#e6eaf2]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef3ff] text-[#4f7cff]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M5.2 12.5C3.4 12.5 2 11.1 2 9.3C2 7.5 3.4 6.1 5.2 6.1H8.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M14.8 7.5C16.6 7.5 18 8.9 18 10.7C18 12.5 16.6 13.9 14.8 13.9H11.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7.5 10H12.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1f2433]">
                      Open Bill
                    </p>
                    <p className="text-xs text-[#8a93a5]">Pay as you go</p>
                  </div>
                </div>
                {sessionMode === "open" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#14b87a] text-white">
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 4L3.8 6.5L9 1.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-[#e6eaf2] bg-white px-4 py-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#eef1f6] bg-[#f8f9fc] text-[#9aa2b1]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 7V4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 9L4.5 7.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M17 9L19.5 7.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6.5 17.5L17.5 6.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8.5 19.5C10.5 21.5 13.5 21.5 15.5 19.5C17.5 17.5 17.5 14.5 15.5 12.5C13.5 10.5 10.5 10.5 8.5 12.5C6.5 14.5 6.5 17.5 8.5 19.5Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                </span>
                <p className="mt-4 text-sm font-semibold text-[#1f2433]">
                  Unlimited Time
                </p>
                <p className="mt-1 text-xs text-[#8a93a5]">
                  Stop anytime. Ideal for casual play.
                </p>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => onSessionModeChange("timed")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSessionModeChange("timed");
                }
              }}
              className={`flex h-full flex-col rounded-2xl border p-4 text-left transition ${
                sessionMode === "timed"
                  ? "border-[#14b87a] shadow-[0_10px_24px_rgba(20,184,122,0.2)]"
                  : "border-[#e6eaf2]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3e8ff] text-[#8b5cf6]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M5.5 2H14.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M6.8 2.8L9 6L11 6L13.2 2.8"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.5 7H13.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7 7.5L9.5 10.5L7 13.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M13 7.5L10.5 10.5L13 13.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M5.5 18H14.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#1f2433]">
                      Timed Session
                    </p>
                    <p className="text-xs text-[#8a93a5]">Pre-paid hours</p>
                  </div>
                </div>
                {sessionMode === "timed" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#14b87a] text-white">
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 4L3.8 6.5L9 1.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </div>

              <div
                className={`mt-4 flex flex-1 flex-col rounded-xl border px-4 py-4 ${
                  sessionMode === "timed"
                    ? "border-[#14b87a] bg-[#f2fffb]"
                    : "border-[#e6eaf2] bg-white"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#8a93a5]">
                  <span>Set Duration (1-24 Hours)</span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      sessionMode === "timed"
                        ? "bg-[#14b87a] text-white"
                        : "bg-[#eef1f6] text-[#9aa2b1]"
                    }`}
                  >
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 4L3.8 6.5L9 1.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onDurationChange(durationHours - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e6eaf2] text-[#9aa2b1]"
                  >
                    -
                  </button>
                  <div className="flex items-end gap-1 rounded-lg border border-[#e6eaf2] bg-white px-4 py-2 text-xl font-semibold text-[#1f2433] shadow-[0_6px_12px_rgba(16,24,40,0.08)]">
                    {durationHours}
                    <span className="pb-0.5 text-xs font-medium text-[#9aa2b1]">
                      hrs
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDurationChange(durationHours + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e6eaf2] text-[#9aa2b1]"
                  >
                    +
                  </button>
                </div>

                <div className="mt-4">
                  <div className="relative h-4">
                    <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-[#e6eaf2]" />
                    <div
                      className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[#14b87a]"
                      style={{ width: `${durationPercent}%` }}
                    />
                    <div
                      className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-[#14b87a] shadow-[0_4px_10px_rgba(20,184,122,0.35)]"
                      style={{ left: `calc(${durationPercent}% - 8px)` }}
                    />
                    <input
                      type="range"
                      min={1}
                      max={24}
                      value={durationHours}
                      onChange={(event) =>
                        onDurationChange(Number(event.target.value))
                      }
                      className="absolute inset-0 h-4 w-full cursor-pointer opacity-0"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#9aa2b1]">
                    {[1, 6, 12, 18, 24].map((tick) => (
                      <span
                        key={tick}
                        className={
                          durationHours === tick ? "text-[#14b87a]" : ""
                        }
                      >
                        {tick}h
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-[#8a93a5]">
                  <span>Rate per hour</span>
                  <span className="font-semibold text-[#6b7280]">
                    {formatRupiah(ratePerHour)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm font-semibold text-[#14b87a]">
                  <span>Total Estimate</span>
                  <span>{formatRupiah(totalEstimate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] italic text-[#8a93a5]">
              * Session starts immediately upon confirmation
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-[#e6eaf2] px-4 py-2 text-xs font-semibold text-[#6b7280]"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex items-center gap-2 rounded-lg bg-[#14b87a] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(20,184,122,0.3)]"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 2.3C3 1.9 3.4 1.66 3.72 1.86L7.9 4.56C8.2 4.76 8.2 5.24 7.9 5.44L3.72 8.14C3.4 8.34 3 8.1 3 7.7V2.3Z"
                    fill="white"
                  />
                </svg>
                Confirm Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
