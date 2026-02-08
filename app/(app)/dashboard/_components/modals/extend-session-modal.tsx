import { useState } from "react";
import type { StationRuntime } from "../types";
import {
  getDurationParts,
  getRemainingMs,
  getTimedEndAt,
  getElapsedMs,
} from "../billing";
import { formatClock, formatDuration, formatRupiah } from "../format";

type ExtendSessionModalProps = {
  station: StationRuntime | null;
  now: number;
  ratePerHour: number;
  onConfirm: (stationId: number, extendMinutes: number) => void;
  onClose: () => void;
};

const presetExtensions = [30, 60, 120];
const clampValue = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const MAX_HOURS = 24;

const PS4_SPECIAL_RATE = 8333.33;
const PS4_THRESHOLD_HOURS = 3;

const isPS4Device = (model: string) => {
  const normalized = model.toLowerCase().replace(/\s+/g, "");
  return normalized.includes("playstation4") || normalized.includes("ps4");
};

export function ExtendSessionModal({
  station,
  now,
  ratePerHour,
  onConfirm,
  onClose,
}: ExtendSessionModalProps) {
  const [extendMinutes, setExtendMinutes] = useState(60);

  if (!station || !station.session || station.session.mode !== "timed") {
    return null;
  }

  const endAt = getTimedEndAt(station.session);
  const remainingMs = getRemainingMs(station.session, now);
  const elapsedMs = getElapsedMs(station.session, now);
  const currentTotalHours = (elapsedMs + remainingMs) / 3_600_000;
  const newTotalHours = currentTotalHours + (extendMinutes / 60);
  
  const isPS4 = station.model && isPS4Device(station.model);
  const willTriggerSpecialRate = isPS4 && currentTotalHours < PS4_THRESHOLD_HOURS && newTotalHours >= PS4_THRESHOLD_HOURS;
  const alreadySpecialRate = isPS4 && currentTotalHours >= PS4_THRESHOLD_HOURS;
  
  const effectiveRate = (isPS4 && newTotalHours >= PS4_THRESHOLD_HOURS) ? PS4_SPECIAL_RATE : ratePerHour;
  const additionalCost = Math.round((extendMinutes * effectiveRate) / 60);
  
  const newEndAt = endAt + extendMinutes * 60_000;
  const { hours, minutes } = getDurationParts(extendMinutes);
  const isConfirmDisabled = extendMinutes <= 0;

  const handleHoursChange = (value: number) => {
    if (Number.isNaN(value)) {
      return;
    }
    const nextHours = clampValue(value, 0, MAX_HOURS);
    setExtendMinutes(nextHours * 60 + minutes);
  };

  const handleMinutesChange = (value: number) => {
    if (Number.isNaN(value)) {
      return;
    }
    const nextMinutes = clampValue(value, 0, 59);
    setExtendMinutes(hours * 60 + nextMinutes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/55 px-4 py-8">
      <div className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-[#f6d5d5] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.32)]">
        <div className="flex items-start justify-between bg-[#f04747] px-5 py-4 text-white">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M8 3.2C10.65 3.2 12.8 5.35 12.8 8C12.8 10.65 10.65 12.8 8 12.8C5.35 12.8 3.2 10.65 3.2 8"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M8 2V5.2H11.2"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-sm font-semibold">Extend Session Time</h2>
              <p className="text-[11px] text-white/70">
                Station {station.id} - Timed Session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center text-white/80 hover:text-white"
            aria-label="Close modal"
          >
            x
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#eef1f6] bg-white px-3 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9aa2b1]">
                Remaining Time
              </p>
              <div className="mt-2 flex items-center justify-center gap-1 font-mono text-sm font-semibold text-[#1f2433]">
                {formatDuration(remainingMs)}
                <span className="text-[#f59e0b]">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 1H11"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M5 15H11"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6 4H10"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 4C10 6.5 8 7.5 8 9.5C8 11.5 10 12.5 10 12.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6 4C6 6.5 8 7.5 8 9.5C8 11.5 6 12.5 6 12.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-[#eef1f6] bg-white px-3 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9aa2b1]">
                Current End Time
              </p>
              <p className="mt-2 text-sm font-semibold text-[#1f2433]">
                {formatClock(endAt)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold text-[#8a93a5]">Extend by</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {presetExtensions.map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setExtendMinutes(minutes)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                    extendMinutes === minutes
                      ? "bg-[#f04747] text-white shadow-[0_8px_20px_rgba(240,71,71,0.25)]"
                      : "border border-[#e6eaf2] bg-white text-[#6b7280]"
                  }`}
                >
                  {minutes >= 60
                    ? `+ ${minutes / 60} ${minutes === 60 ? "Hour" : "Hours"}`
                    : `+ ${minutes}m`}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between rounded-lg border border-[#e6eaf2] bg-white px-3 py-2 text-xs text-[#6b7280]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e6eaf2] text-[#9aa2b1]">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="5.2"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M8 5.5V8.5L10 9.8"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  type="number"
                  min={0}
                  max={MAX_HOURS}
                  value={hours}
                  onChange={(event) =>
                    handleHoursChange(Number(event.target.value))
                  }
                  className="w-12 bg-transparent text-center text-sm font-semibold text-[#1f2433] outline-none"
                  aria-label="Extend hours"
                />
                <span className="text-[10px] font-semibold text-[#9aa2b1]">
                  HRS
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#e6eaf2] bg-white px-3 py-2 text-xs text-[#6b7280]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e6eaf2] text-[#9aa2b1]">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="5.2"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M8 5.5V8.5L10 9.8"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(event) =>
                    handleMinutesChange(Number(event.target.value))
                  }
                  className="w-12 bg-transparent text-center text-sm font-semibold text-[#1f2433] outline-none"
                  aria-label="Extend minutes"
                />
                <span className="text-[10px] font-semibold text-[#9aa2b1]">
                  MINS
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#dbeafe] bg-[#f1f7ff] px-4 py-3 text-xs text-[#3b82f6]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#3b82f6]">
                Additional Cost
              </span>
              <span className="text-sm font-semibold text-[#2563eb]">
                + {formatRupiah(additionalCost)}
              </span>
            </div>
            {(willTriggerSpecialRate || alreadySpecialRate) && (
              <div className="mt-1 text-[10px] text-[#f59e0b]">
                {willTriggerSpecialRate 
                  ? "⚡ PS4 Special Rate will apply (total ≥3 hours)"
                  : "⚡ PS4 Special Rate Applied"}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-[#3b82f6]">
              <span>New End Time</span>
              <span className="text-sm font-semibold text-[#1d4ed8]">
                {formatClock(newEndAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#eef1f6] px-5 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#e6eaf2] bg-white px-4 py-2 text-xs font-semibold text-[#6b7280]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(station.id, extendMinutes)}
            disabled={isConfirmDisabled}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#f04747] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(240,71,71,0.3)] ${
              isConfirmDisabled ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-white">
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
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Confirm Extension
          </button>
        </div>
      </div>
    </div>
  );
}
