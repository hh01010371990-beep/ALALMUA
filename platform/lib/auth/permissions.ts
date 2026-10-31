import type { UserRole } from "@/types/database";

const adminRoles: UserRole[] = [
  "SUPER_ADMIN", "CEO", "OPERATIONS_MANAGER", "SALES_MANAGER",
  "MARKETING_MANAGER", "CONTENT_MANAGER", "AI_MANAGER"
];

export function isAdminRole(role?: UserRole | null) {
  return !!role && adminRoles.includes(role);
}

export function canManageMarketplace(role?: UserRole | null) {
  return isAdminRole(role) || role === "SELLER";
}