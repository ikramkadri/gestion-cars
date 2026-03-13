import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. جدول السيارات
  cars: defineTable({
    make: v.string(),
    model: v.string(),
    year: v.number(),
    imageUrl: v.string(),
    purchasePrice: v.number(),
    price: v.number(),
    mileage: v.number(),
    condition: v.union(v.literal("Excellent"), v.literal("Good"), v.literal("Fair"), v.literal("Poor")),
    status: v.union(v.literal("Available"), v.literal("Sold")),
    isArchived: v.boolean(),
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

  // 3. جدول المبيعات
  sales: defineTable({
    invoiceNumber: v.string(),
    carId: v.id("cars"),
    customerId: v.id("customers"),
    saleDate: v.string(),
    amountPaid: v.number(),
    paymentMethod: v.string(),
    sellerId: v.id("users"),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
  .index("by_carId", ["carId"])
  .index("by_invoice", ["invoiceNumber"]),

  // 4. جدول المستخدمين
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

  // 5. سجل النشاطات
  activityLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    entity: v.string(),
    entityId: v.string(),
    details: v.string(),
    timestamp: v.string(),
  }).index("by_timestamp", ["timestamp"]),
});
