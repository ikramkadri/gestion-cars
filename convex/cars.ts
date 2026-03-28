import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * إضافة سيارة جديدة مع تفعيل إشعار النظام (Dashboard Notification)
 */
export const addCar = mutation({
  args: {
    make: v.string(), 
    model: v.string(), 
    year: v.number(), 
    images: v.array(v.string()), 
    mainImage: v.string(), 
    purchasePrice: v.number(), 
    price: v.number(), 
    mileage: v.number(),
    condition: v.union(v.literal("Excellent"), v.literal("Good"), v.literal("Fair"), v.literal("Poor")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("غير مصرح");

    const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user || user.role === "viewer") throw new Error("لا تملك صلاحية الإضافة");

    const now = Date.now();
    const carId = await ctx.db.insert("cars", {
      ...args, 
      status: "Available", 
      isArchived: false, 
      createdAt: now, 
      updatedAt: now,
    });

    // تسجيل إشعار في الجدول الجديد
    await ctx.db.insert("notifications", {
      title: "مخزون جديد 🚗",
      message: `تم إضافة ${args.make} ${args.model} للمخزن بنجاح`,
      type: "info",
      isRead: false,
      createdAt: now,
    });

    return carId;
  },
});

/**
 * جلب السيارات مع الفلترة المتقدمة
 */
export const getCars = query({
  args: {
    make: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // تم تغيير let إلى const هنا لحل مشكلة التنبيه (Linter error)
    const carsQuery = ctx.db.query("cars").filter((q) => q.eq(q.field("isArchived"), false));
    
    const allCars = await carsQuery.order("desc").collect();

    return allCars.filter((car) => {
      const matchMake = args.make ? car.make.toLowerCase().includes(args.make.toLowerCase()) : true;
      const matchStatus = args.status ? car.status === args.status : true;
      return matchMake && matchStatus;
    });
  },
});

/**
 * تحديث بيانات السيارة (مع التحقق من الرتبة)
 */
export const updateCar = mutation({
  args: {
    carId: v.id("cars"),
    updates: v.object({
      price: v.optional(v.number()),
      status: v.optional(v.union(v.literal("Available"), v.literal("Sold"))),
      condition: v.optional(v.union(v.literal("Excellent"), v.literal("Good"), v.literal("Fair"), v.literal("Poor"))),
      description: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("غير مصرح");

    const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user || user.role === "viewer") throw new Error("لا تملك صلاحية التعديل");
    
    await ctx.db.patch(args.carId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

/**
 * أرشفة السيارة (Soft Delete)
 */
export const archiveCar = mutation({
  args: { carId: v.id("cars") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("غير مصرح");

    const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user || user.role === "viewer") throw new Error("لا تملك صلاحية الأرشفة");

    await ctx.db.patch(args.carId, {
      isArchived: true,
      updatedAt: Date.now(),
    });
  },
});

/**
 * جلب الإشعارات غير المقروءة
 */
export const getNotifications = query({
  handler: async (ctx) => {
    return await ctx.db.query("notifications")
      .withIndex("by_read_status", (q) => q.eq("isRead", false))
      .order("desc")
      .collect();
  },
});

/**
 * تحديد الإشعارات كمقروءة
 */
export const markNotificationsRead = mutation({
  handler: async (ctx) => {
    const unread = await ctx.db.query("notifications")
      .withIndex("by_read_status", (q) => q.eq("isRead", false))
      .collect();
    
    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }
  },
});