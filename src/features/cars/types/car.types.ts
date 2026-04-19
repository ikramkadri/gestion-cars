import { Id } from "../../../../convex/_generated/dataModel";

/**
 * هذا الملف يحدد شكل البيانات (Interface) لكل سيارة في النظام.
 * تعديل هذا الملف سيحل أخطاء TypeScript في AdminCars.tsx
 */

export type CarType = {
  _id: Id<"cars">;
  _creationTime?: number;
  make: string;
  model: string;
  year: number;
  price: number;
  purchasePrice: number;
  mainImage: string;
  images: string[];
  mileage: number;
  fuel: "Gasoline" | "Diesel" | "Electric" | "Hybrid";
  transmission: "Automatic" | "Manual";
  drivetrain: "FWD" | "RWD" | "AWD" | "4WD";
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  status: "Available" | "Sold";
  isArchived: boolean;
  description?: string;
  engineSize?: string;
  color?: string;
  madeIn?: string;        // ✅ تم التأكد من وجوده لحل خطأ الصورة
  bids?: number;
  reservePrice?: number;  // ✅ تم التأكد من وجوده لحل خطأ الصورة
};

export type AddCarInput = {
  make: string;
  model: string;
  year: number;
  images: string[];
  mainImage: string;
  purchasePrice: number;
  price: number;
  mileage: number;
  fuel: "Gasoline" | "Diesel" | "Electric" | "Hybrid";
  transmission: "Automatic" | "Manual";
  drivetrain: "FWD" | "RWD" | "AWD" | "4WD";
  engineSize?: string;
  color?: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  description?: string;
  madeIn?: string;        // ✅ متاح للإضافة
  reservePrice?: number;  // ✅ متاح للإضافة
};

export type UpdateCarInput = {
  price: number;
  status: "Available" | "Sold";
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  description?: string;
};

// تجميع أنواع البيانات المستخدمة في الـ Modal
export type CarModalData = AddCarInput | UpdateCarInput;

/**
 * ✅ Type Guards
 * دوال مساعدة للتأكد من نوع البيانات داخل الكود
 */

export function isUpdateCarInput(data: CarModalData): data is UpdateCarInput {
  return 'status' in data && !('make' in data);
}

export function isAddCarInput(data: CarModalData): data is AddCarInput {
  return 'make' in data;
}