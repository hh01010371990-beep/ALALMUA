export type UserRole =
  | "SUPER_ADMIN" | "CEO" | "OPERATIONS_MANAGER" | "SALES_MANAGER"
  | "SALES_AGENT" | "MARKETING_MANAGER" | "CONTENT_MANAGER"
  | "TECHNICIAN" | "AI_MANAGER" | "SELLER" | "CUSTOMER";

export type SellerType =
  | "AL_HAZEM_OFFICIAL" | "OFFICIAL_BRAND" | "AUTHORIZED_DEALER"
  | "MARKETPLACE_SELLER" | "SERVICE_PROVIDER";

export type SellerStatus =
  | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "SUSPENDED" | "REJECTED" | "ARCHIVED";

export interface Product {
  id: string;
  name: string;
  brand_id?: string;
  category_id?: string;
  dimensions?: { width?: number; height?: number; depth?: number };
  electricity_consumption?: number;
  warranty_months?: number;
  has_3d_model: boolean;
  has_ar_model: boolean;
}