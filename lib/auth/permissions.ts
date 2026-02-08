type EmployeeRole = "Manager" | "Admin" | "Cashier";

export type Permission =
  | "dashboard:read"
  | "dashboard:write"
  | "devices:read"
  | "devices:write"
  | "snacks:read"
  | "snacks:write"
  | "employees:read"
  | "employees:write"
  | "payments:read"
  | "payments:write"
  | "finance:read"
  | "finance:write"
  | "transactions:read"
  | "transactions:write"
  | "settings:read"
  | "settings:write";

const allPermissions: Permission[] = [
  "dashboard:read",
  "dashboard:write",
  "devices:read",
  "devices:write",
  "snacks:read",
  "snacks:write",
  "employees:read",
  "employees:write",
  "payments:read",
  "payments:write",
  "finance:read",
  "finance:write",
  "transactions:read",
  "transactions:write",
  "settings:read",
  "settings:write",
];

const rolePermissions: Record<EmployeeRole, Permission[]> = {
  Manager: allPermissions,
  Admin: allPermissions,
  Cashier: [
    "dashboard:read",
    "dashboard:write",
    "devices:read",
    "snacks:read",
  ],
};

export const getRolePermissions = (role: EmployeeRole) =>
  rolePermissions[role] ?? [];

export const hasPermission = (role: EmployeeRole, permission: Permission) =>
  getRolePermissions(role).includes(permission);
