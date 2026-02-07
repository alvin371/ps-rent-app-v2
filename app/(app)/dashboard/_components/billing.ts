import type { OrderItem, StationSession } from "./types";

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

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

export const getRentalCost = (session: StationSession, now: number) => {
  if (session.mode === "timed") {
    const minutes = session.durationMinutes ?? 0;
    return Math.round((minutes * session.ratePerHour) / 60);
  }
  const elapsedMs = getElapsedMs(session, now);
  return Math.round((elapsedMs * session.ratePerHour) / HOUR_MS);
};

export const getOrdersSubtotal = (orders: OrderItem[]) =>
  orders.reduce((total, order) => total + order.price * order.qty, 0);

export const getDurationParts = (totalMinutes: number) => ({
  hours: Math.floor(totalMinutes / 60),
  minutes: totalMinutes % 60,
});
