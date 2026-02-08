import { randomBytes, scrypt } from "crypto";
import { PrismaClient } from "@prisma/client";
import { promisify } from "util";

const prisma = new PrismaClient();

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;
const SALT_LEN = 16;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

const encode = (value) => value.toString("base64");

const hashPassword = async (password) => {
  const salt = randomBytes(SALT_LEN);
  const derivedKey = await scryptAsync(password, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });

  return [
    "scrypt",
    String(SCRYPT_N),
    String(SCRYPT_R),
    String(SCRYPT_P),
    encode(salt),
    encode(derivedKey),
  ].join("$");
};

const DEFAULT_PASSWORD = "password123";

const deviceTypes = [
  {
    name: "PlayStation 3",
    code: "PS3",
    hourlyRate: 5000,
    serviceInterval: 180,
    isActive: true,
  },
  {
    name: "PlayStation 4",
    code: "PS4",
    hourlyRate: 8000,
    serviceInterval: 150,
    isActive: true,
  },
  {
    name: "PlayStation 5",
    code: "PS5",
    hourlyRate: 12000,
    serviceInterval: 120,
    isActive: true,
  },
];

const devices = [
  {
    name: "Station 01",
    model: "PlayStation 5",
    status: "Active",
    rate: 12000,
    service: new Date("2026-02-20"),
  },
  {
    name: "Station 02",
    model: "PlayStation 5",
    status: "Active",
    rate: 12000,
    service: new Date("2026-02-22"),
  },
  {
    name: "Station 03",
    model: "PlayStation 4",
    status: "Maintenance",
    rate: 8000,
    service: new Date("2026-02-12"),
  },
  {
    name: "Station 04",
    model: "PlayStation 4",
    status: "Offline",
    rate: 8000,
    service: new Date("2026-01-28"),
  },
  {
    name: "Station 05",
    model: "PlayStation 5",
    status: "Active",
    rate: 12000,
    service: new Date("2026-02-25"),
  },
  {
    name: "Station 06",
    model: "PlayStation 3",
    status: "Active",
    rate: 5000,
    service: new Date("2026-03-02"),
  },
  {
    name: "Station 07",
    model: "PlayStation 3",
    status: "Offline",
    rate: 5000,
    service: new Date("2026-02-01"),
  },
  {
    name: "Station 08",
    model: "PlayStation 4",
    status: "Active",
    rate: 8000,
    service: new Date("2026-02-18"),
  },
  {
    name: "Station 09",
    model: "PlayStation 5",
    status: "Maintenance",
    rate: 12000,
    service: new Date("2026-02-14"),
  },
  {
    name: "Station 10",
    model: "PlayStation 4",
    status: "Active",
    rate: 8000,
    service: new Date("2026-03-05"),
  },
];

const snacks = [
  {
    sku: "SNK-001",
    name: "Indomie Goreng",
    category: "Food",
    sellPrice: 8000,
    costPrice: 5500,
    stockOnHand: 40,
    lowStockThreshold: 10,
    isActive: true,
  },
  {
    sku: "SNK-002",
    name: "Indomie Soto",
    category: "Food",
    sellPrice: 8000,
    costPrice: 5500,
    stockOnHand: 32,
    lowStockThreshold: 10,
    isActive: true,
  },
  {
    sku: "SNK-003",
    name: "Pop Mie",
    category: "Food",
    sellPrice: 12000,
    costPrice: 8500,
    stockOnHand: 24,
    lowStockThreshold: 8,
    isActive: true,
  },
  {
    sku: "SNK-004",
    name: "Nasi Goreng",
    category: "Food",
    sellPrice: 20000,
    costPrice: 15000,
    stockOnHand: 12,
    lowStockThreshold: 4,
    isActive: true,
  },
  {
    sku: "SNK-005",
    name: "Mie Ayam",
    category: "Food",
    sellPrice: 18000,
    costPrice: 13000,
    stockOnHand: 10,
    lowStockThreshold: 4,
    isActive: true,
  },
  {
    sku: "SNK-006",
    name: "Kentang Goreng",
    category: "Snack",
    sellPrice: 15000,
    costPrice: 10000,
    stockOnHand: 18,
    lowStockThreshold: 6,
    isActive: true,
  },
  {
    sku: "SNK-007",
    name: "Sosis Bakar",
    category: "Snack",
    sellPrice: 12000,
    costPrice: 8000,
    stockOnHand: 20,
    lowStockThreshold: 6,
    isActive: true,
  },
  {
    sku: "SNK-008",
    name: "Chitato",
    category: "Snack",
    sellPrice: 10000,
    costPrice: 7000,
    stockOnHand: 26,
    lowStockThreshold: 8,
    isActive: true,
  },
  {
    sku: "SNK-009",
    name: "Lays Classic",
    category: "Snack",
    sellPrice: 10000,
    costPrice: 7000,
    stockOnHand: 22,
    lowStockThreshold: 8,
    isActive: true,
  },
  {
    sku: "SNK-010",
    name: "Taro Net",
    category: "Snack",
    sellPrice: 9000,
    costPrice: 6500,
    stockOnHand: 24,
    lowStockThreshold: 8,
    isActive: true,
  },
  {
    sku: "SNK-011",
    name: "Chiki Balls",
    category: "Snack",
    sellPrice: 8000,
    costPrice: 5500,
    stockOnHand: 30,
    lowStockThreshold: 10,
    isActive: true,
  },
  {
    sku: "SNK-012",
    name: "Oreo",
    category: "Snack",
    sellPrice: 10000,
    costPrice: 7500,
    stockOnHand: 18,
    lowStockThreshold: 6,
    isActive: true,
  },
  {
    sku: "SNK-013",
    name: "Aqua 600ml",
    category: "Drink",
    sellPrice: 5000,
    costPrice: 3500,
    stockOnHand: 60,
    lowStockThreshold: 12,
    isActive: true,
  },
  {
    sku: "SNK-014",
    name: "Teh Botol Sosro",
    category: "Drink",
    sellPrice: 7000,
    costPrice: 5000,
    stockOnHand: 48,
    lowStockThreshold: 12,
    isActive: true,
  },
  {
    sku: "SNK-015",
    name: "Coca Cola",
    category: "Drink",
    sellPrice: 9000,
    costPrice: 6500,
    stockOnHand: 30,
    lowStockThreshold: 10,
    isActive: true,
  },
  {
    sku: "SNK-016",
    name: "Fanta",
    category: "Drink",
    sellPrice: 9000,
    costPrice: 6500,
    stockOnHand: 28,
    lowStockThreshold: 10,
    isActive: true,
  },
  {
    sku: "SNK-017",
    name: "Sprite",
    category: "Drink",
    sellPrice: 9000,
    costPrice: 6500,
    stockOnHand: 28,
    lowStockThreshold: 10,
    isActive: true,
  },
  {
    sku: "SNK-018",
    name: "Pocari Sweat",
    category: "Drink",
    sellPrice: 10000,
    costPrice: 7500,
    stockOnHand: 26,
    lowStockThreshold: 8,
    isActive: true,
  },
  {
    sku: "SNK-019",
    name: "Milo Box",
    category: "Drink",
    sellPrice: 12000,
    costPrice: 9000,
    stockOnHand: 20,
    lowStockThreshold: 6,
    isActive: true,
  },
  {
    sku: "SNK-020",
    name: "Minute Maid Pulpy",
    category: "Drink",
    sellPrice: 12000,
    costPrice: 9000,
    stockOnHand: 18,
    lowStockThreshold: 6,
    isActive: true,
  },
];

const roles = [
  {
    name: "Admin",
    permissions: [
      "dashboard:read",
      "dashboard:write",
      "devices:read",
      "devices:write",
      "employees:read",
      "employees:write",
      "finance:read",
      "finance:write",
      "payments:read",
      "payments:write",
      "transactions:read",
      "transactions:write",
      "settings:read",
      "settings:write",
    ],
  },
  {
    name: "Manager",
    permissions: [
      "dashboard:read",
      "dashboard:write",
      "devices:read",
      "devices:write",
      "finance:read",
      "payments:read",
      "transactions:read",
    ],
  },
  {
    name: "Cashier",
    permissions: [
      "dashboard:read",
      "dashboard:write",
    ],
  },
];

const employees = [
  {
    name: "Alya Putri",
    email: "alya.putri@psrental.com",
    username: "@alyaputri",
    role: "Manager",
    status: "Active",
    lastLogin: "2026-02-06 09:20",
  },
  {
    name: "Rizky Mahendra",
    email: "rizky.mahendra@psrental.com",
    username: "@rizkymahendra",
    role: "Admin",
    status: "Active",
    lastLogin: "2026-02-07 08:05",
  },
  {
    name: "Siti Aulia",
    email: "siti.aulia@psrental.com",
    username: "@sitiaulia",
    role: "Cashier",
    status: "Active",
    lastLogin: "2026-02-07 11:42",
  },
  {
    name: "Dimas Saputra",
    email: "dimas.saputra@psrental.com",
    username: "@dimassaputra",
    role: "Cashier",
    status: "Inactive",
    lastLogin: "2026-01-30 17:10",
  },
  {
    name: "Nadia Rahma",
    email: "nadia.rahma@psrental.com",
    username: "@nadiarahma",
    role: "Manager",
    status: "Active",
    lastLogin: "2026-02-05 14:55",
  },
];

const payments = [
  {
    name: "Cash",
    status: "Paid",
  },
  {
    name: "Debit Card",
    status: "Paid",
  },
  {
    name: "Credit Card",
    status: "Paid",
  },
  {
    name: "QRIS",
    status: "Pending",
  },
  {
    name: "E-Wallet",
    status: "Failed",
  },
];

async function main() {
  const defaultPasswordHash = await hashPassword(DEFAULT_PASSWORD);
  const employeesWithHash = employees.map((employee) => ({
    ...employee,
    passwordHash: defaultPasswordHash,
    lastLogin: employee.lastLogin ? new Date(employee.lastLogin) : null,
  }));

  // Delete in correct order to respect foreign keys
  await prisma.transaction.deleteMany();
  await prisma.rentalOrderItem.deleteMany();
  await prisma.rentalSession.deleteMany();
  await prisma.cashDrawer.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.device.deleteMany();
  await prisma.deviceType.deleteMany();
  await prisma.snack.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.role.deleteMany();

  await prisma.role.createMany({ data: roles });
  await prisma.deviceType.createMany({ data: deviceTypes });
  await prisma.device.createMany({ data: devices });
  await prisma.snack.createMany({ data: snacks });
  await prisma.employee.createMany({ data: employeesWithHash });
  await prisma.payment.createMany({ data: payments });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
