import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({  
  cars: defineTable({
    make: v.string(), 
    model: v.string(), 
    year: v.number(), 
    description: v.optional(v.string()), 
    images: v.array(v.string()), 
    mainImage: v.string(), 
    purchasePrice: v.number(), 
    price: v.number(), 
    mileage: v.number(), 
    condition: v.union(v.literal("Excellent"), v.literal("Good"), v.literal("Fair"), v.literal("Poor")), 
    status: v.union(v.literal("Available"), v.literal("Sold")), 
    isArchived: v.boolean(), 
    createdAt: v.number(), 
    updatedAt: v.number(),
  })
  .index("by_status", ["status", "isArchived"])
  .index("by_make_model", ["make", "model"]),

  customers: defineTable({
    fullName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_phone", ["phone"]),

  sales: defineTable({
    invoiceNumber: v.string(),
    carId: v.id("cars"),
    customerId: v.id("customers"),
    saleDate: v.number(),
    amountPaid: v.number(),
    paymentMethod: v.union(v.literal("Cash"), v.literal("Bank Transfer"), v.literal("Card"), v.literal("Check")), 
    sellerId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_invoice", ["invoiceNumber"]).index("by_date", ["saleDate"]),

  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    clerkId: v.string(),
    role: v.union(v.literal("admin"), v.literal("sales_manager"), v.literal("viewer")), 
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  favorites: defineTable({
    userId: v.id("users"),
    carId: v.id("cars"),
    createdAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_user_car", ["userId", "carId"]),

  bookings: defineTable({
    carId: v.id("cars"),
    userId: v.id("users"),
    bookingDate: v.number(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
    createdAt: v.number(),
  }).index("by_car", ["carId"]).index("by_user", ["userId"]),

  // الجدول المفقود الذي كان يسبب الخطأ
  notifications: defineTable({
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("error")),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_read_status", ["isRead"]),

  activity_logs: defineTable({
    action: v.string(),
    details: v.string(),
    userId: v.id("users"),
    timestamp: v.number(),
  }).index("by_user", ["userId"]).index("by_timestamp", ["timestamp"]),
});