type DeviceStatus = "Active" | "Maintenance" | "Offline";
type EmployeeRole = "Manager" | "Admin" | "Cashier";
type EmployeeStatus = "Active" | "Inactive";
type PaymentStatus = "Paid" | "Pending" | "Failed";

type DeviceType = {
  id: string;
  name: string;
  code: string;
  hourlyRate: number;
  serviceInterval: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Device = {
  id: string;
  name: string;
  model: string;
  status: DeviceStatus;
  rate: number;
  service: Date;
  createdAt: Date;
  updatedAt: Date;
};

type Snack = {
  id: string;
  sku: string;
  name: string;
  category: string;
  sellPrice: number;
  costPrice: number;
  stockOnHand: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Employee = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type Payment = {
  id: string;
  name: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
};

const dateOnly = (value: Date) => value.toISOString().slice(0, 10);

export const serializeDevice = (device: Device) => ({
  id: device.id,
  name: device.name,
  model: device.model,
  status: device.status,
  rate: String(device.rate),
  service: dateOnly(device.service),
});

export const serializeDeviceType = (deviceType: DeviceType) => ({
  id: deviceType.id,
  name: deviceType.name,
  code: deviceType.code,
  hourlyRate: String(deviceType.hourlyRate),
  serviceInterval: String(deviceType.serviceInterval),
  isActive: deviceType.isActive,
});

export const serializeSnack = (snack: Snack) => ({
  id: snack.id,
  sku: snack.sku,
  name: snack.name,
  category: snack.category,
  sellPrice: String(snack.sellPrice),
  costPrice: String(snack.costPrice),
  stockOnHand: String(snack.stockOnHand),
  lowStockThreshold: String(snack.lowStockThreshold),
  isActive: snack.isActive,
});

export const serializeEmployee = (employee: Employee) => ({
  id: employee.id,
  name: employee.name,
  email: employee.email,
  username: employee.username,
  role: employee.role,
  status: employee.status,
  lastLogin: employee.lastLogin ? employee.lastLogin.toISOString() : "",
});

export const serializePayment = (payment: Payment) => ({
  id: payment.id,
  name: payment.name,
  status: payment.status,
});
