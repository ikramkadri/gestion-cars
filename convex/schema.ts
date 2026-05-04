import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // جدول السيارات المحدث: يجمع بين الحقول الجديدة ومميزات البحث الاحترافي
  cars: defineTable({
    make: v.string(), 
    model: v.string(), 
    origin: v.optional(v.string()), 
    year: v.number(), 
    description: v.optional(v.string()),
    images: v.array(v.id("_storage")), // تم التغيير لتخزين معرفات التخزين
    mainImage: v.id("_storage"), // تم التغيير لتخزين معرف التخزين الرئيسي
    sellerId: v.id("users"),        // الحقل كان مفقوداً ويسبب خطأ في cars.ts
    purchasePrice: v.number(), 
    price: v.number(), 
    mileage: v.number(), 
    location: v.string(),           // الموقع (جديد)
    hasWarranty: v.boolean(),       // الضمان (جديد)
    cylinders: v.optional(v.number()), // الأسطوانات (جديد)
    fuel: v.union(v.literal("Gasoline"), v.literal("Diesel"), v.literal("Electric"), v.literal("Hybrid")),
    transmission: v.union(v.literal("Automatic"), v.literal("Manual")),
    drivetrain: v.union(v.literal("FWD"), v.literal("RWD"), v.literal("AWD"), v.literal("4WD")),
    engineSize: v.optional(v.string()),
    color: v.optional(v.string()),
    condition: v.union(v.literal("New"), v.literal("Excellent"), v.literal("Good"), v.literal("Fair"), v.literal("Poor")),
    viewCount: v.number(),          // إضافة حقل عدد المشاهدات
    status: v.union(v.literal("Available"), v.literal("Sold")),
    slug: v.string(),               // الحقل كان مفقوداً ويسبب خطأ في الدوال
    isArchived: v.boolean(), 
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_status_archived", ["status", "isArchived"]) 
  .index("by_make_model", ["make", "model"])
  .index("by_price", ["price"])
  .index("by_location", ["location"]) 
  .index("by_status", ["status"]) // إضافة فهرس للحالة لتحسين أداء التصفية
  .index("by_slug", ["slug"])       // الفهرس كان مفقوداً
  .index("by_archived", ["isArchived", "archivedAt"])
  .searchIndex("search_cars", {     // ميزة البحث المتقدم
    searchField: "model",
    filterFields: ["make", "status", "location"]
  }),

  // جدول المستخدمين (نظام Convex الصافي - بدون Clerk)
  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    password: v.string(),
    profileImageId: v.optional(v.id("_storage")),
    role: v.union(v.literal("admin"), v.literal("sales_manager"), v.literal("viewer")),
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

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
  })
  .index("by_invoice", ["invoiceNumber"])
  .index("by_car", ["carId"]) 
  .index("by_date", ["saleDate"])
  .index("by_customer", ["customerId"]),

  favorites: defineTable({
    userId: v.id("users"),
    carId: v.id("cars"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_user_car", ["userId", "carId"]),

  bookings: defineTable({
    carId: v.id("cars"),
    userId: v.id("users"),
    bookingDate: v.number(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled")),
    createdAt: v.number(),
    updatedAt: v.number(), // إضافة حقل updatedAt هنا
  })
  .index("by_car", ["carId"])
  .index("by_user", ["userId"])
  .index("by_status", ["status"]),

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

  site_settings: defineTable({
    showroomName: v.string(),
    contactPhone: v.string(),
    contactEmail: v.string(),
    address: v.string(),
    currency: v.string(), 
    updatedAt: v.number(),
  }),

  // جدول الجلسات لضمان بقاء المستخدم مسجلاً دون الحاجة لمفاتيح خارجية
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expires: v.number(),
  }).index("by_token", ["token"]),
});