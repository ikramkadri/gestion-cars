import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // جدول السيارات المحدث: يجمع بين الحقول الجديدة ومميزات البحث الاحترافي
  cars: defineTable({
    make: v.string(), 
    model: v.string(), 
    searchName: v.string(),         // حقل مدمج للبحث المتقدم (Make + Model + Year)
    origin: v.optional(v.string()), 
    year: v.number(), 
    description: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
    mainImage: v.optional(v.id("_storage")),
    sellerId: v.id("users"),        // الحقل كان مفقوداً ويسبب خطأ في cars.ts
    purchasePrice: v.number(), 
    price: v.number(), 
    mileage: v.number(), 
    vin: v.optional(v.string()), // Made optional
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
    status: v.union(v.literal("Available"), v.literal("Sold"), v.literal("Reserved")),
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
    searchField: "searchName",
    filterFields: ["make", "status", "location", "isArchived"]
  }),

  // جدول المستخدمين (نظام Convex الصافي - بدون Clerk)
  users: defineTable({
    fullName: v.string(),
    email: v.string(),
    password: v.string(),
    phone: v.optional(v.string()),   // إضافة رقم الهاتف للمستخدم
    address: v.optional(v.string()), // إضافة الحقل المفقود ليطابق users.ts
    profileImageId: v.optional(v.id("_storage")),
    role: v.union(v.literal("admin"), v.literal("sales_manager"), v.literal("viewer")),
    status: v.string(), // active, suspended, etc.
    verified: v.boolean(),
    verificationToken: v.optional(v.string()), // توكن تأكيد الإيميل
    verificationTokenExpires: v.optional(v.number()), // تاريخ انتهاء التوكن
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  customers: defineTable({
    fullName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()), // إعادة حقل العنوان (اختياري)
    identityNum: v.optional(v.string()), // إعادة حقل رقم الهوية (اختياري)
    status: v.string(), // إضافة حقل الحالة: (مثل: "خالص"، "دين")
    totalPurchases: v.number(), // إضافة حقل إجمالي المشتريات كـ رقم
    userId: v.optional(v.id("users")), // ربط اختياري بحساب المستخدم الرقمي
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_phone", ["phone"])
    .index("by_user", ["userId"]),

  sales: defineTable({
    invoiceNumber: v.string(),
    customerName: v.string(),
    carName: v.string(),
    carId: v.id("cars"),
    bookingId: v.optional(v.id("bookings")), // ربط البيع بالحجز المحدد
    customerId: v.id("customers"),
    userId: v.optional(v.id("users")), // ربط البيع بحساب المستخدم المسجل
    saleDate: v.number(),
    amountPaid: v.number(),
    taxAmount: v.number(),           // مبلغ الضريبة
    registrationFees: v.number(),     // رسوم التسجيل
    subtotal: v.number(),            // المبلغ الصافي قبل الضريبة والرسوم
    vin: v.string(),                 // رقم الهيكل وقت البيع
    mileageAtSale: v.number(),       // الكيلومتراج وقت البيع
    paymentMethod: v.union(v.literal("Cash"), v.literal("Bank Transfer"), v.literal("Card"), v.literal("Check")),
    deliveryStatus: v.optional(v.union(v.literal("processed"), v.literal("quality_check"), v.literal("shipped"), v.literal("delivered"))),
    sellerId: v.id("users"),
    isArchived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).searchIndex("search_sales", {
    searchField: "customerName",
    filterFields: ["isArchived", "invoiceNumber", "carName"] // Add carName to filterFields
  }) // Add search index for customerName and carName
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
    userId: v.optional(v.id("users")), // جعل المستخدم اختيارياً لدعم الـ Guest
    bookingDate: v.number(),
    bookingReference: v.string(),    // مرجع الحجز (e.g., MTX-1234)
    customerPhone: v.string(),       // رقم الهاتف (ضروري جداً للاتصال/واتساب)
    customerLocation: v.string(),    // ولاية الزبون
    guestName: v.optional(v.string()), // اسم الزبون في حال لم يسجل
    inspectionDate: v.optional(v.number()), // موعد المعاينة المختار
    message: v.optional(v.string()), // رسالة قصيرة (مثلاً: أريد المقايضة)
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("cancelled"), v.literal("rejected"), v.literal("archived")), // إضافة حالة "archived"
    verificationMethod: v.optional(v.union(v.literal("phone_call"), v.literal("whatsapp"), v.literal("manual"))),
    bookingSource: v.optional(v.union(v.literal("website"), v.literal("whatsapp"), v.literal("phone_call"), v.literal("facebook"))),
    rejectionReason: v.optional(v.string()), // حقل سبب الرفض
    createdAt: v.number(),
    updatedAt: v.number(), // إضافة حقل updatedAt هنا
  })
  .index("by_car", ["carId"])
  .index("by_user", ["userId"])
  .index("by_status", ["status"])
  .index("by_phone", ["customerPhone"])
  .index("by_createdAt", ["createdAt"]), // إضافة فهرس لتسريع عمليات التنظيف

  blocked_phones: defineTable({
    phone: v.string(),
    reason: v.optional(v.string()),
    blockedBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_phone", ["phone"]),

  notifications: defineTable({
    userId: v.optional(v.id("users")), // معرف المستلم (اختياري للزبائن، فارغ للإدارة)
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("error"), v.literal("reservation"), v.literal("system")),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))), // جعل حقل الأولوية اختيارياً
    isRead: v.boolean(), // isRead is already defined
    actionUrl: v.optional(v.string()), // الرابط الذي يوجه إليه الإشعار
    actionType: v.optional(v.string()), // "APPROVE_USER" نوع الإجراء مثل
    targetId: v.optional(v.string()),   // معرف السجل المستهدف (مثل معرف المستخدم)
    createdAt: v.number(),
  }).index("by_read_status", ["isRead"])
    .index("by_user", ["userId"])
    .index("by_createdAt", ["createdAt"]), // إضافة فهرس لتسريع عمليات التنظيف

  activity_logs: defineTable({
    action: v.string(),
    details: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_createdAt", ["createdAt"]),

  site_settings: defineTable({
    showroomName: v.string(),
    contactPhone: v.string(),
    contactWhatsApp: v.optional(v.string()),
    contactEmail: v.string(),
    address: v.string(),
    currency: v.string(), 
    logoImageId: v.optional(v.id("_storage")), // إضافة حقل لمعرف صورة الشعار
    updatedAt: v.number(),
  }),

  // جدول الجلسات لضمان بقاء المستخدم مسجلاً دون الحاجة لمفاتيح خارجية
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expires: v.number(),
  }).index("by_token", ["token"]),

  //  إضافة جدول المراجعات المفقود لحل مشكلة الـ TypeScript تماماً
  reviews: defineTable({
    carId: v.id("cars"),
    userId: v.id("users"),
    userName: v.string(),
    rating: v.number(),
    comment: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(), // إضافة حقل updatedAt
  })
  .index("by_car", ["carId"])
  .index("by_status", ["status"])
  .index("by_createdAt", ["createdAt"]), // إضافة فهرس لتسريع عمليات التنظيف
});