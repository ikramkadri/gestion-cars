import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

/**
 * دالة مساعدة للتحقق من هوية المستخدم ودوره
 */
async function getAuthenticatedUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("غير مصرح: يجب تسجيل الدخول");
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
    
  if (!user) throw new Error("المستخدم غير موجود في النظام");
  return user;
}

/**
 * دالة لتصفية البيانات الحساسة (سعر الشراء) للمستخدمين غير المديرين
 * تم استخدام Doc<"cars"> بدلاً من any لحل خطأ TypeScript
 */
function removeSensitiveCarData(car: Doc<"cars">) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { purchasePrice, ...publicData } = car;
  return publicData;
}

/**
 * إضافة سيارة جديدة للمخزون
 */
export const addCar = mutation({
  args: {
    make: v.string(),
    model: v.string(),
    year: v.number(),
    imageUrl: v.string(),
    purchasePrice: v.number(),
    price: v.number(),
    mileage: v.number(),
    condition: v.union(v.literal("Excellent"), v.literal("Good"), v.literal("Fair"), v.literal("Poor")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("فقط المدير يمكنه إضافة سيارات");

    const now = new Date().toISOString();
    const carId = await ctx.db.insert("cars", {
      ...args,
      status: "Available",
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLogs", {
      userId: user._id,
      action: "ADD_CAR",
      entity: "cars",
      entityId: carId,
      details: `تم إضافة سيارة جديدة: ${args.make} ${args.model}`,
      timestamp: now,
    });

    return carId;
  },
});

/**
 * جلب السيارات المتاحة للجمهور مع نظام بحث وفلترة احترافي
 * يدعم البحث النصي، السعر الأقصى، والحالة
 */
export const getPublicCars = query({
  args: { 
    searchQuery: v.optional(v.string()), // للبحث بـ (ماركة، موديل، سنة)
    maxPrice: v.optional(v.number()),    // فلتر السعر الأقصى
    condition: v.optional(v.string()),   // فلتر الحالة
  },
  handler: async (ctx, args) => {
    // البدء بجلب السيارات المتاحة فقط لتقليل حمل البيانات
    let cars = await ctx.db
      .query("cars")
      .withIndex("by_status", (q) => q.eq("status", "Available").eq("isArchived", false))
      .order("desc")
      .collect();

    // 1. تطبيق البحث النصي الشامل (الماركة، الموديل، السنة)
    if (args.searchQuery) {
      const q = args.searchQuery.toLowerCase();
      cars = cars.filter(c => 
        c.make.toLowerCase().includes(q) || 
        c.model.toLowerCase().includes(q) ||
        c.year.toString().includes(q)
      );
    }

    // 2. تطبيق فلتر السعر الأقصى
    if (args.maxPrice) {
      cars = cars.filter(c => c.price <= args.maxPrice!);
    }

    // 3. تطبيق فلتر الحالة (Excellent, Good, etc.)
    if (args.condition && args.condition !== "All") {
      cars = cars.filter(c => c.condition === args.condition);
    }
    
    // إرجاع البيانات بدون سعر الشراء لحماية الخصوصية التجارية
    return cars.map(removeSensitiveCarData);
  },
});

/**
 * أرشفة سيارة (حذف ناعم)
 */
export const archiveCar = mutation({
  args: { id: v.id("cars") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("صلاحية الأرشفة للمدير فقط");

    const car = await ctx.db.get(args.id);
    if (!car) throw new Error("السيارة غير موجودة");
    
    const now = new Date().toISOString();
    await ctx.db.patch(args.id, { isArchived: true, updatedAt: now });

    await ctx.db.insert("activityLogs", {
      userId: user._id,
      action: "ARCHIVE_CAR",
      entity: "cars",
      entityId: args.id,
      details: `تم أرشفة السيارة: ${car.make} ${car.model}`,
      timestamp: now,
    });
  },
});

/**
 * جلب تفاصيل سيارة محددة بالمعرف
 * يعرض سعر الشراء فقط إذا كان المستخدم مديراً
 */
export const getCarById = query({
  args: { id: v.id("cars") },
  handler: async (ctx, args) => {
    const car = await ctx.db.get(args.id);
    if (!car || car.isArchived) return null;

    const identity = await ctx.auth.getUserIdentity();
    let isAdmin = false;
    
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();
      isAdmin = user?.role === "admin";
    }

    // إذا لم يكن مديراً، نحذف سعر الشراء قبل الإرسال
    if (!isAdmin) {
      return removeSensitiveCarData(car);
    }

    return car;
  },
});
