export type SessionMode = "open" | "timed";
export type PaymentMethod = "cash" | "qris" | "debt";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  label: string;
  tone: string;
};

export type OrderItem = {
  snackId: string;
  name: string;
  price: number;
  qty: number;
  tone: string;
};

export type StationSession = {
  id: string;
  mode: SessionMode;
  startAt: number;
  ratePerHour: number;
  durationMinutes?: number;
  endAt?: number;
  stoppedAt?: number;
};

export type StationRuntime = {
  id: number;
  deviceId: string;
  name: string;
  model: string;
  status: "Active" | "Maintenance" | "Offline";
  ratePerHour: number;
  session: StationSession | null;
  orders: OrderItem[];
  lastSession: { startAt: number; endAt: number } | null;
};

export type StationOrderView = {
  label: string;
  count: number;
  tone: string;
};

export type StationViewAction = {
  label: string;
  variant: string;
  onClick?: () => void;
  disabled?: boolean;
};

export type StationView = {
  id: number;
  model?: string;
  offline?: boolean;
  status: string;
  statusColor: string;
  headerBg: string;
  headerText: string;
  cardBorder: string;
  cardShadow: string;
  statusDetail: string[] | null;
  time: string;
  lastSession: string;
  orderTotal: string;
  orderTotalColor: string;
  rentalCost: string;
  snacksTotal: string;
  rate: string | null;
  orders: StationOrderView[];
  total: string;
  totalVariant: string;
  totalTextColor: string;
  actions: StationViewAction[];
  isOrderable: boolean;
};
