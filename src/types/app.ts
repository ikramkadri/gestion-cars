import type { Doc } from "../../convex/_generated/dataModel";
import { CarType } from "../features/cars/types/car.types";

/**
 * يمثل عملية بيع مع تفاصيل إضافية مجمعة من جداول السيارات والزبائن
 * يتم استخدام هذا النوع في لوحة التحكم (Sales Page)
 */
export type SaleWithDetails = Doc<"sales"> & {
  carName: string;
  customerName: string;
  sellerName: string;
  profit?: number; // Added profit field
  phone?: string;
  email?: string;
  address?: string;
  identityNum?: string;
};

export type UserRole = "admin" | "sales_manager" | "viewer";

export interface ClientDetails extends Doc<"customers"> {
  _id: Doc<"customers">["_id"];
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  identityNum?: string;
  status: string;
  totalPurchases: number;
  createdAt: number;
  updatedAt: number;
}

export interface BookingWithDetails extends Doc<"bookings"> {
  carDetails: CarType;
  clientDetails: ClientDetails;
  status: "pending" | "confirmed" | "cancelled" | "rejected";
  rejectionReason?: string;
}