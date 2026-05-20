import type { Doc } from "../../convex/_generated/dataModel";

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

/** رتب المستخدمين مستخرجة مباشرة من قاعدة البيانات لضمان التطابق التام */
export type UserRole = Doc<"users">["role"];

/** 
 * تفاصيل الزبون: نستخدم النوع المولد تلقائياً من Convex 
 * هذا يغنينا عن صيانة قائمة الحقول يدوياً هنا وفي schema.ts
 */
export type ClientDetails = Doc<"customers">;

/**
 * يمثل طلب حجز مع البيانات الكاملة للسيارة والزبون
 * نستخدم التقاطع (&) لإضافة الحقول التي يتم جلبها عبر الـ Join في Query
 */
export type BookingWithDetails = Doc<"bookings"> & { // The booking itself
  carDetails: Doc<"cars">; // Details of the car that was booked
  clientDetails: Doc<"users"> | null; // يمكن أن يكون null للزوار
  customerPhone: string; // ضمان توفر الهاتف في الحجز
  customerLocation: string; // ضمان توفر الولاية في الحجز
  inspectionDate?: number; // موعد المعاينة
  bookingReference: string;
  guestName?: string;
  verificationMethod?: "phone_call" | "whatsapp" | "manual";
  bookingSource?: "website" | "whatsapp" | "phone_call" | "facebook";
};