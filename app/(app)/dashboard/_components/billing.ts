import type { OrderItem, StationSession } from "./types";

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const PS4_SPECIAL_RATE = 8333.33;
const PS4_THRESHOLD_HOURS = 3;

const isPS4Device = (model: string) => {
  const normalized = model.toLowerCase().replace(/\s+/g, "");
  return normalized.includes("playstation4") || normalized.includes("ps4");
};

export const getRatePerMinute = (ratePerHour: number) => ratePerHour / 60;

export const getTimedEndAt = (session: StationSession) =>
  session.endAt ?? session.startAt + (session.durationMinutes ?? 0) * MINUTE_MS;

export const getElapsedMs = (session: StationSession, now: number) =>
  Math.max(0, (session.stoppedAt ?? now) - session.startAt);

export const getRemainingMs = (session: StationSession, now: number) => {
  if (session.mode !== "timed") {
    return 0;
  }
  const endAt = getTimedEndAt(session);
  const reference = session.stoppedAt ?? now;
  return Math.max(0, endAt - reference);
};

export const getRentalCost = (session: StationSession, now: number, deviceModel?: string) => {
  const elapsedMs = getElapsedMs(session, now);
  const elapsedHours = elapsedMs / HOUR_MS;
  
  if (deviceModel && isPS4Device(deviceModel) && elapsedHours >= PS4_THRESHOLD_HOURS) {
    return Math.round(elapsedHours * PS4_SPECIAL_RATE);
  }

  if (session.mode === "timed") {
    const minutes = session.durationMinutes ?? 0;
    const hours = minutes / 60;
    if (deviceModel && isPS4Device(deviceModel) && hours >= PS4_THRESHOLD_HOURS) {
      return Math.round(hours * PS4_SPECIAL_RATE);
    }
    return Math.round((minutes * session.ratePerHour) / 60);
  }
  
  return Math.round((elapsedMs * session.ratePerHour) / HOUR_MS);
};

export const getOrdersSubtotal = (orders: OrderItem[]) =>
  orders.reduce((total, order) => total + order.price * order.qty, 0);

export const getDurationParts = (totalMinutes: number) => ({
  hours: Math.floor(totalMinutes / 60),
  minutes: totalMinutes % 60,
});
