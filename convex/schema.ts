import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. جدول السيارات: مع الحفاظ على كافة الفهارس لضمان عمل دوال البحث والإحصائيات
  cars: defineTable({
    make: v.string(),
    model: v.string(),
    year: v.number(),
    imageUrl: v.string(),
    purchasePrice: v.number(), // سعر الشراء (مهم جداً لحساب الأرباح في statistics.ts)
    price: v.number(),         // سعر البيع المعلن
    mileage: v.number(),
    condition: v.union(v.literal("Excellent"), v.literal("Good"), v.literal("Fair"), v.literal("Poor")),
    status: v.union(v.literal("Available"), v.literal("Sold")),
    isArchived: v.boolean(),   // للـ Soft Delete
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_status", ["status", "isArchived"])
  .index("by_make", ["make"])
  .index("by_year", ["year"])
  .index("by_price", ["price"]),

  // 2. جدول الزبائن
  customers: defineTable({
    fullName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_phone", ["phone"]),

  // 3. جدول المبيعات: تم دمج رقم الفاتورة الاحترافي مع الحفاظ على الروابط الأساسية
  sales: defineTable({
    invoiceNumber: v.string(), // الرقم الاحترافي (مثال: INV-2025-0001)
    carId: v.id("cars"),
    customerId: v.id("customers"),
    saleDate: v.string(),
    amountPaid: v.number(),
    paymentMethod: v.string(),
    sellerId: v.id("users"),   // الموظف الذي أتم العملية
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_carId", ["carId"])
  .index("by_invoice", ["invoiceNumber"]),

  // 4. جدول المستخدمين: مع الحفاظ على حقول الربط مع Clerk
  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("customer"), v.literal("guest")),
    clerkId: v.string(),
    lastLogin: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_email", ["email"])
  .index("by_clerkId", ["clerkId"]),

  // 5. سجل النشاطات (Audit Trail)
  activityLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    entity: v.string(),
    entityId: v.string(),
    details: v.string(),
    timestamp: v.string(),
  }).index("by_timestamp", ["timestamp"]),
});