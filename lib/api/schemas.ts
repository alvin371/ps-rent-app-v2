import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalId = z.string().trim().min(1).optional();

const numberField = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return value;
    if (typeof value === "string") {
      const normalized = value.replace(/[^\d.-]/g, "");
      return normalized.length > 0 ? Number(normalized) : value;
    }
    return value;
  },
  z.number().int().nonnegative()
);

const positiveIntField = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return value;
    if (typeof value === "string") {
      const normalized = value.replace(/[^\d]/g, "");
      return normalized.length > 0 ? Number(normalized) : value;
    }
    return value;
  },
  z.number().int().positive()
);

export const deviceSchema = z
  .object({
    id: optionalId,
    name: nonEmptyString,
    model: nonEmptyString,
    status: z.enum(["Active", "Maintenance", "Offline"]),
    rate: numberField,
    service: z.coerce.date(),
  })
  .strict();

export const deviceUpdateSchema = deviceSchema.omit({ id: true }).partial();

export const deviceTypeSchema = z
  .object({
    id: optionalId,
    name: nonEmptyString,
    code: nonEmptyString,
    hourlyRate: numberField,
    serviceInterval: numberField,
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const deviceTypeUpdateSchema = deviceTypeSchema
  .omit({ id: true })
  .partial();

export const snackSchema = z
  .object({
    id: optionalId,
    sku: nonEmptyString,
    name: nonEmptyString,
    category: nonEmptyString,
    sellPrice: numberField,
    costPrice: numberField,
    stockOnHand: numberField,
    lowStockThreshold: numberField,
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const snackUpdateSchema = snackSchema.omit({ id: true }).partial();

export const employeeSchema = z
  .object({
    id: optionalId,
    name: nonEmptyString,
    email: z.string().trim().email(),
    username: nonEmptyString,
    role: z.enum(["Manager", "Admin", "Cashier"]),
    status: z.enum(["Active", "Inactive"]).optional().default("Active"),
    lastLogin: z.string().trim().optional().nullable(),
  })
  .strict();

export const employeeCreateSchema = employeeSchema
  .omit({ id: true, lastLogin: true })
  .extend({
    password: z.string().min(8),
  })
  .strict();

export const employeeUpdateSchema = employeeSchema
  .omit({ id: true, lastLogin: true })
  .extend({
    password: z.string().min(8).optional(),
  })
  .partial();

export const paymentSchema = z
  .object({
    id: optionalId,
    name: nonEmptyString,
    status: z.enum(["Paid", "Pending", "Failed"]),
  })
  .strict();

export const paymentUpdateSchema = paymentSchema.omit({ id: true }).partial();

export const loginSchema = z
  .object({
    username: nonEmptyString,
    password: z.string().min(1),
  })
  .strict();

export const sessionStartSchema = z
  .object({
    mode: z.enum(["open", "timed"]),
    durationMinutes: z.number().int().positive().optional(),
  })
  .strict();

export const sessionExtendSchema = z
  .object({
    extendMinutes: z.number().int().positive(),
  })
  .strict();

export const orderAdjustSchema = z
  .object({
    snackId: nonEmptyString,
    delta: z.number().int(),
  })
  .strict();

export const checkoutSchema = z
  .object({
    paymentMethod: z.enum(["cash", "qris", "debt"]),
  })
  .strict();

export const transactionCreateSchema = z
  .object({
    kind: z.enum(["inventory", "expense"]),
    snackId: optionalId,
    qty: positiveIntField.optional(),
    description: nonEmptyString,
    amount: numberField,
    notes: nonEmptyString,
    occurredAt: z.coerce.date(),
  })
  .superRefine((data, ctx) => {
    if (data.amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be greater than zero.",
        path: ["amount"],
      });
    }
    if (data.kind === "inventory") {
      if (!data.snackId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Snack is required for inventory transactions.",
          path: ["snackId"],
        });
      }
      if (!data.qty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Quantity is required for inventory transactions.",
          path: ["qty"],
        });
      }
    }
  })
  .strict();
