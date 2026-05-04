import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth"; // استيراد دالة المصادقة الموحدة

export const createBooking = mutation({
  args: { carId: v.id("cars"), bookingDate: v.number(), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("يجب تسجيل الدخول للحجز.");
    // المستخدم موجود بالفعل إذا تم المصادقة عليه

    const car = await ctx.db.get(args.carId);
    if (!car || car.status !== "Available" || car.isArchived) throw new Error("عذراً، هذه السيارة غير متاحة");

    const now = Date.now();
    const bookingId = await ctx.db.insert("bookings", {
      carId: args.carId, 
      userId: user._id, 
      bookingDate: args.bookingDate, 
      status: "pending", 
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("notifications", { title: "طلب حجز جديد 📅", message: `قام ${user.fullName} بحجز موعد`, type: "warning", isRead: false, createdAt: now });
    return bookingId;
  },
});

export const getMyBookings = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) return []; // إذا لم يكن هناك مستخدم مصادق عليه، لا توجد حجوزات

    const bookings = await ctx.db.query("bookings").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    return await Promise.all(bookings.map(async (b) => ({ ...b, car: await ctx.db.get(b.carId) })));
  },
});

export const updateBookingStatus = mutation({
  args: { 
    bookingId: v.id("bookings"), 
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),
    token: v.string(), // إضافة التوكن للمصادقة
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") throw new Error("غير مصرح لك بتحديث حالة الحجز."); // فقط الأدمن يمكنه تحديث الحالة
    await ctx.db.patch(args.bookingId, { status: args.status, updatedAt: Date.now() }); // الآن هذا الحقل موجود في الـ Schema
  },
});