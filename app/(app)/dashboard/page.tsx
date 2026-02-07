"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api/client";
import { DashboardHeader } from "./_components/dashboard-header";
import { StationGrid } from "./_components/station-grid";
import { CheckoutModal } from "./_components/modals/checkout-modal";
import { ExtendSessionModal } from "./_components/modals/extend-session-modal";
import { OrderModal } from "./_components/modals/order-modal";
import { StartSessionModal } from "./_components/modals/start-session-modal";
import { StopSessionModal } from "./_components/modals/stop-session-modal";
import {
  getElapsedMs,
  getOrdersSubtotal,
  getRemainingMs,
  getRentalCost,
  getTimedEndAt,
} from "./_components/billing";
import {
  formatClock,
  formatClockWithSeconds,
  formatDuration,
  formatRupiah,
} from "./_components/format";
import type {
  MenuItem,
  PaymentMethod,
  SessionMode,
  StationRuntime,
  StationView,
} from "./_components/types";

type StationApi = {
  id: string;
  name: string;
  status: "Active" | "Maintenance" | "Offline";
  ratePerHour: number;
  session: {
    id: string;
    mode: SessionMode;
    ratePerHour: number;
    startAt: string;
    durationMinutes: number | null;
    endAt: string | null;
    stoppedAt: string | null;
  } | null;
  orders: {
    snackId: string;
    name: string;
    category: string;
    price: number;
    qty: number;
  }[];
  lastSession: { startAt: string; endAt: string } | null;
};

type SnackApi = {
  id: string;
  name: string;
  category: string;
  sellPrice: string;
  isActive: boolean;
};

const idleTheme = {
  status: "TERSEDIA",
  statusColor: "text-[#22c55e]",
  headerBg: "bg-[#141824]",
  headerText: "text-white",
  cardBorder: "border-[#e6eaf2]",
  cardShadow: "shadow-[0_10px_24px_rgba(16,24,40,0.08)]",
  totalVariant: "bg-[#f3f5f9] border border-[#e6eaf2] text-[#1f2433]",
  totalTextColor: "text-[#1f2433]",
};

const activeTheme = {
  status: "PLAYING",
  statusColor: "text-white/80",
  headerBg: "bg-[#f04747]",
  headerText: "text-white",
  cardBorder: "border-[#f4c7c7]",
  cardShadow: "shadow-[0_12px_28px_rgba(240,71,71,0.2)]",
  totalVariant: "bg-white border border-[#111827] text-[#111827]",
  totalTextColor: "text-[#111827]",
};

const checkoutTheme = {
  status: "CHECKOUT",
  statusColor: "text-white/90",
  headerBg: "bg-[#f59e0b]",
  headerText: "text-white",
  cardBorder: "border-[#fde68a]",
  cardShadow: "shadow-[0_12px_28px_rgba(245,158,11,0.2)]",
  totalVariant: "bg-white border border-[#f59e0b] text-[#92400e]",
  totalTextColor: "text-[#92400e]",
};

const categoryToneMap: Record<string, string> = {
  Makanan: "bg-[#fff5c4] text-[#f59e0b]",
  Minuman: "bg-[#e6f0ff] text-[#3b82f6]",
  Snack: "bg-[#fff4d9] text-[#f59e0b]",
  Food: "bg-[#fff5c4] text-[#f59e0b]",
  Drink: "bg-[#e6f0ff] text-[#3b82f6]",
  Beverage: "bg-[#e6f0ff] text-[#3b82f6]",
  Lainnya: "bg-[#f3f4f6] text-[#111827]",
};

const buildMenuTabs = (categories: string[]) => [
  { label: "All Items", tone: "bg-[#f04747] text-white" },
  ...categories.map((category) => ({
    label: category,
    tone: "bg-white text-[#6b7280] border border-[#e6eaf2]",
  })),
];

export default function DashboardPage() {
  const [stations, setStations] = useState<StationRuntime[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuTabs, setMenuTabs] = useState<{ label: string; tone: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [startModalStation, setStartModalStation] = useState<number | null>(
    null
  );
  const [orderModalStation, setOrderModalStation] = useState<number | null>(
    null
  );
  const [checkoutModalStation, setCheckoutModalStation] = useState<
    number | null
  >(null);
  const [extendModalStation, setExtendModalStation] = useState<number | null>(
    null
  );
  const [stopModalStation, setStopModalStation] = useState<number | null>(null);
  const [sessionMode, setSessionMode] = useState<SessionMode>("timed");
  const [durationHours, setDurationHours] = useState(12);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const refreshStations = useCallback(async (toneById: Map<string, string>) => {
    const stationData = await apiFetch<StationApi[]>("/api/stations");
    setStations(
      stationData.map((station, index) => ({
        id: index + 1,
        deviceId: station.id,
        name: station.name,
        status: station.status,
        ratePerHour: station.ratePerHour,
        session: station.session
          ? {
              id: station.session.id,
              mode: station.session.mode,
              ratePerHour: station.session.ratePerHour,
              startAt: new Date(station.session.startAt).getTime(),
              durationMinutes: station.session.durationMinutes ?? undefined,
              endAt: station.session.endAt
                ? new Date(station.session.endAt).getTime()
                : undefined,
              stoppedAt: station.session.stoppedAt
                ? new Date(station.session.stoppedAt).getTime()
                : undefined,
            }
          : null,
        orders: station.orders.map((order) => ({
          snackId: order.snackId,
          name: order.name,
          price: order.price,
          qty: order.qty,
          tone: toneById.get(order.snackId) ??
            categoryToneMap[order.category] ??
            "bg-[#f3f4f6] text-[#111827]",
        })),
        lastSession: station.lastSession
          ? {
              startAt: new Date(station.lastSession.startAt).getTime(),
              endAt: new Date(station.lastSession.endAt).getTime(),
            }
          : null,
      }))
    );
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const snackData = await apiFetch<SnackApi[]>("/api/snacks");
        if (!isMounted) return;
        const activeSnacks = snackData.filter((snack) => snack.isActive);
        const menu = activeSnacks.map((snack) => ({
          id: snack.id,
          name: snack.name,
          price: Number(snack.sellPrice),
          label: snack.name.slice(0, 1).toUpperCase(),
          tone: categoryToneMap[snack.category] ?? "bg-[#f3f4f6] text-[#111827]",
        }));
        const categories = Array.from(
          new Set(activeSnacks.map((snack) => snack.category))
        );
        setMenuItems(menu);
        setMenuTabs(buildMenuTabs(categories));

        const toneById = new Map(menu.map((item) => [item.id, item.tone]));
        await refreshStations(toneById);
      } catch (err) {
        if (!isMounted) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [refreshStations]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toneById = useMemo(
    () => new Map(menuItems.map((item) => [item.id, item.tone])),
    [menuItems]
  );

  const handleOpenStartModal = (stationId: number) => {
    const station = stations.find((item) => item.id === stationId);
    if (!station || station.session || station.status !== "Active") {
      return;
    }
    setStartModalStation(stationId);
    setSessionMode("timed");
    setDurationHours(12);
  };

  const handleCloseStartModal = () => {
    setStartModalStation(null);
  };

  const handleConfirmStartSession = async () => {
    if (startModalStation === null) {
      return;
    }
    const station = stations.find((item) => item.id === startModalStation);
    if (!station) {
      return;
    }

    try {
      await apiFetch(`/api/stations/${station.deviceId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: sessionMode,
          durationMinutes: sessionMode === "timed" ? durationHours * 60 : undefined,
        }),
      });
      await refreshStations(toneById);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to start session");
    }

    setOrderModalStation((prev) =>
      prev === startModalStation ? null : prev
    );
    setExtendModalStation((prev) =>
      prev === startModalStation ? null : prev
    );
    setStopModalStation((prev) => (prev === startModalStation ? null : prev));
    setCheckoutModalStation((prev) =>
      prev === startModalStation ? null : prev
    );
    handleCloseStartModal();
  };

  const handleOpenOrderModal = (stationId: number) => {
    const station = stations.find((item) => item.id === stationId);
    if (!station?.session || station.session.stoppedAt) {
      return;
    }
    setOrderModalStation(stationId);
  };

  const handleCloseOrderModal = () => {
    setOrderModalStation(null);
  };

  const handleAddOrderItem = async (stationId: number, item: MenuItem) => {
    const station = stations.find((entry) => entry.id === stationId);
    if (!station?.session || station.session.stoppedAt) {
      return;
    }
    try {
      await apiFetch(`/api/stations/${station.deviceId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snackId: item.id, delta: 1 }),
      });
      await refreshStations(toneById);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to add order");
    }
  };

  const handleAdjustOrderQty = async (
    stationId: number,
    snackId: string,
    delta: number
  ) => {
    const station = stations.find((entry) => entry.id === stationId);
    if (!station?.session || station.session.stoppedAt) {
      return;
    }
    try {
      await apiFetch(`/api/stations/${station.deviceId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snackId, delta }),
      });
      await refreshStations(toneById);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to update order"
      );
    }
  };

  const handleRemoveOrderItem = async (stationId: number, snackId: string) => {
    const station = stations.find((entry) => entry.id === stationId);
    if (!station?.session || station.session.stoppedAt) {
      return;
    }
    const existing = station.orders.find((order) => order.snackId === snackId);
    if (!existing) return;
    await handleAdjustOrderQty(stationId, snackId, -existing.qty);
  };

  const handleOpenExtendModal = (stationId: number) => {
    const station = stations.find((item) => item.id === stationId);
    if (!station?.session || station.session.mode !== "timed") {
      return;
    }
    if (station.session.stoppedAt) {
      return;
    }
    setExtendModalStation(stationId);
  };

  const handleCloseExtendModal = () => {
    setExtendModalStation(null);
  };

  const handleConfirmExtend = async (
    stationId: number,
    extendMinutes: number
  ) => {
    const station = stations.find((entry) => entry.id === stationId);
    if (!station?.session || station.session.mode !== "timed") {
      return;
    }
    if (station.session.stoppedAt) {
      return;
    }

    try {
      await apiFetch(`/api/stations/${station.deviceId}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extendMinutes }),
      });
      await refreshStations(toneById);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to extend session"
      );
    }
    handleCloseExtendModal();
  };

  const handleOpenStopModal = (stationId: number) => {
    const station = stations.find((item) => item.id === stationId);
    if (!station?.session) {
      return;
    }
    setStopModalStation(stationId);
  };

  const handleCloseStopModal = () => {
    setStopModalStation(null);
  };

  const handleOpenCheckoutModal = (stationId: number) => {
    setCheckoutModalStation(stationId);
    setPaymentMethod("cash");
  };

  const handleCloseCheckoutModal = () => {
    setCheckoutModalStation(null);
  };

  const handleStopAndCheckout = async (stationId: number) => {
    const station = stations.find((entry) => entry.id === stationId);
    if (!station?.session) {
      return;
    }

    try {
      await apiFetch(`/api/stations/${station.deviceId}/stop`, {
        method: "POST",
      });
      await refreshStations(toneById);
      handleOpenCheckoutModal(stationId);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to stop session"
      );
    }
    handleCloseStopModal();
  };

  const handleCompletePayment = async (stationId: number) => {
    const station = stations.find((entry) => entry.id === stationId);
    if (!station?.session) {
      return;
    }
    try {
      await apiFetch(`/api/stations/${station.deviceId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });
      await refreshStations(toneById);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to complete payment"
      );
    }
    setOrderModalStation((prev) => (prev === stationId ? null : prev));
    setExtendModalStation((prev) => (prev === stationId ? null : prev));
    setStopModalStation((prev) => (prev === stationId ? null : prev));
    handleCloseCheckoutModal();
  };

  const updateDuration = (nextValue: number) => {
    const clamped = Math.min(24, Math.max(1, nextValue));
    setDurationHours(clamped);
  };

  const stationViews: StationView[] = stations.map((station) => {
    const isUnavailable = station.status !== "Active";
    if (isUnavailable) {
      return { id: station.id, offline: true } as StationView;
    }

    const session = station.session;
    const isActive = Boolean(session && !session.stoppedAt);
    const isCheckout = Boolean(session && session.stoppedAt);
    const isTimed = session?.mode === "timed";

    const ordersSubtotal = getOrdersSubtotal(station.orders);
    const rentalCost = session ? getRentalCost(session, now) : 0;
    const total = session ? rentalCost + ordersSubtotal : 0;
    const elapsedMs = session ? getElapsedMs(session, now) : 0;
    const remainingMs = session && isTimed ? getRemainingMs(session, now) : 0;

    const theme = isCheckout ? checkoutTheme : session ? activeTheme : idleTheme;

    const statusDetail = session
      ? isCheckout
        ? ["CHECKOUT", "PAY"]
        : isTimed
          ? [formatClock(getTimedEndAt(session)), "STOP"]
          : ["OPEN", "BILL"]
      : null;

    const time = session
      ? isTimed && isActive
        ? formatDuration(remainingMs)
        : formatDuration(elapsedMs)
      : "00:00:00";

    const lastSession = session
      ? `Started: ${formatClockWithSeconds(session.startAt)}`
      : station.lastSession
        ? `Last Session: ${formatClock(
            station.lastSession.startAt
          )} - ${formatClock(station.lastSession.endAt)}`
        : "No sessions yet";

    const actions = (() => {
      if (!session) {
        return [
          {
            label: "MULAI",
            variant: "bg-[#14b87a] text-white",
            onClick: () => handleOpenStartModal(station.id),
          },
          {
            label: "STOP",
            variant: "bg-[#e6e9ef] text-[#9aa2b1]",
            disabled: true,
          },
        ];
      }
      if (isCheckout) {
        return [
          {
            label: "CHECKOUT",
            variant: "bg-[#2f6fff] text-white",
            onClick: () => handleOpenStopModal(station.id),
          },
        ];
      }
      if (isTimed) {
        return [
          {
            label: "EXTEND",
            variant: "bg-[#f1f3f8] text-[#4b5563]",
            onClick: () => handleOpenExtendModal(station.id),
          },
          {
            label: "STOP",
            variant: "bg-[#f04747] text-white",
            onClick: () => handleOpenStopModal(station.id),
          },
        ];
      }
      return [
        {
          label: "STOP",
          variant: "bg-[#f04747] text-white",
          onClick: () => handleOpenStopModal(station.id),
        },
      ];
    })();

    return {
      id: station.id,
      status: theme.status,
      statusColor: theme.statusColor,
      headerBg: theme.headerBg,
      headerText: theme.headerText,
      cardBorder: theme.cardBorder,
      cardShadow: theme.cardShadow,
      statusDetail,
      time,
      lastSession,
      orderTotal: formatRupiah(ordersSubtotal),
      orderTotalColor:
        ordersSubtotal > 0 ? "text-[#f04747]" : "text-[#9aa2b1]",
      rentalCost: formatRupiah(rentalCost),
      snacksTotal: formatRupiah(ordersSubtotal),
      rate: session
        ? `Rate: ${formatRupiah(session.ratePerHour)}/hr`
        : null,
      orders: station.orders.slice(0, 4).map((order) => ({
        label: order.name,
        count: order.qty,
        tone: order.tone,
      })),
      total: formatRupiah(total),
      totalVariant: theme.totalVariant,
      totalTextColor: theme.totalTextColor,
      actions,
      isOrderable: isActive,
    };
  });

  const orderStation =
    orderModalStation !== null
      ? stations.find((station) => station.id === orderModalStation) ?? null
      : null;
  const orderModalStationId =
    orderStation?.session && !orderStation.session.stoppedAt
      ? orderModalStation
      : null;

  const stopStation =
    stopModalStation !== null
      ? stations.find((station) => station.id === stopModalStation) ?? null
      : null;
  const stopModalStationId = stopStation?.session ? stopModalStation : null;

  const checkoutStation =
    checkoutModalStation !== null
      ? stations.find((station) => station.id === checkoutModalStation) ?? null
      : null;
  const checkoutModalStationId = checkoutStation?.session
    ? checkoutModalStation
    : null;

  const extendStation =
    extendModalStation !== null
      ? stations.find((station) => station.id === extendModalStation) ?? null
      : null;
  const extendModalStationId =
    extendStation?.session &&
    extendStation.session.mode === "timed" &&
    !extendStation.session.stoppedAt
      ? extendModalStation
      : null;

  return (
    <div className="space-y-6">
      <DashboardHeader />

      {loadError ? (
        <div className="rounded-xl border border-[#f8caca] bg-[#feecec] px-4 py-3 text-xs text-[#f04747]">
          {loadError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-[#e6eaf2] bg-white px-4 py-4 text-xs text-[#9aa2b1]">
          Loading stations...
        </div>
      ) : null}

      <StationGrid
        stations={stationViews}
        onOpenOrderModal={handleOpenOrderModal}
      />

      <StartSessionModal
        stationId={startModalStation}
        ratePerHour={
          startModalStation !== null
            ? stations.find((station) => station.id === startModalStation)
                ?.ratePerHour ?? 0
            : 0
        }
        sessionMode={sessionMode}
        onSessionModeChange={setSessionMode}
        durationHours={durationHours}
        onDurationChange={updateDuration}
        onConfirm={handleConfirmStartSession}
        onClose={handleCloseStartModal}
      />

      <OrderModal
        stationId={orderModalStationId}
        orders={orderStation?.orders ?? []}
        menuItems={menuItems}
        menuTabs={menuTabs}
        onAddItem={(item) => {
          if (orderModalStationId !== null) {
            handleAddOrderItem(orderModalStationId, item);
          }
        }}
        onAdjustQty={(snackId, delta) => {
          if (orderModalStationId !== null) {
            handleAdjustOrderQty(orderModalStationId, snackId, delta);
          }
        }}
        onRemoveItem={(snackId) => {
          if (orderModalStationId !== null) {
            handleRemoveOrderItem(orderModalStationId, snackId);
          }
        }}
        onClose={handleCloseOrderModal}
      />

      <CheckoutModal
        station={checkoutModalStationId ? checkoutStation : null}
        now={now}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onCompletePayment={handleCompletePayment}
        onClose={handleCloseCheckoutModal}
      />

      <ExtendSessionModal
        key={extendModalStationId ?? "extend-modal"}
        station={extendModalStationId ? extendStation : null}
        now={now}
        ratePerHour={extendStation?.session?.ratePerHour ?? 0}
        onConfirm={handleConfirmExtend}
        onClose={handleCloseExtendModal}
      />

      <StopSessionModal
        station={stopModalStationId ? stopStation : null}
        now={now}
        onClose={handleCloseStopModal}
        onStopAndCheckout={handleStopAndCheckout}
      />
    </div>
  );
}
