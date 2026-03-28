import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createBooking = mutation({
  args: {
    carId: v.id("cars"),
    bookingDate: v.number(), 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("يجب تسجيل الدخول للحجز");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("المستخدم غير موجود");

    // 1. التحقق من أن التاريخ ليس في الماضي
    if (args.bookingDate < Date.now()) {
      throw new Error("عذراً، لا يمكن الحجز في تاريخ أو وقت سابق");
    }

    // 2. التحقق من حالة السيارة
    const car = await ctx.db.get(args.carId);
    if (!car || car.status !== "Available" || car.isArchived) {
      throw new Error("عذراً، هذه السيارة لم تعد متاحة للحجز");
    }

    // 3. التحقق من التعارض (Booking Conflict)
    // نبحث عن أي حجز مؤكد أو معلق لنفس السيارة في نفس التوقيت
    const conflict = await ctx.db
      .query("bookings")
      .withIndex("by_car", (q) => q.eq("carId", args.carId))
      .filter((q) => q.eq(q.field("bookingDate"), args.bookingDate))
      .first();

    if (conflict && (conflict.status === "confirmed" || conflict.status === "pending")) {
      throw new Error("هذا الموعد محجوز مسبقاً، يرجى اختيار وقت آخر");
    }

    // 4. إتمام الحجز
    const bookingId = await ctx.db.insert("bookings", {
      carId: args.carId,
      userId: user._id,
      bookingDate: args.bookingDate,
      status: "pending",
      createdAt: Date.now(),
    });

    // 5. سجل النشاطات وإشعار الإدارة
    await ctx.db.insert("activity_logs", {
        action: "BOOKING_CREATED",
        details: `حجز جديد للسيارة ${car.make} في تاريخ ${new Date(args.bookingDate).toLocaleString()}`,
        userId: user._id,
        timestamp: Date.now()
    });

    await ctx.db.insert("notifications", {
      title: "طلب حجز جديد 📅",
      message: `قام ${user.fullName} بحجز موعد لمعاينة ${car.make} ${car.model}`,
      type: "warning",
      isRead: false,
      createdAt: Date.now(),
    });

    return bookingId;
  },
});

/**
 * جلب حجوزات المستخدم الحالي مع بيانات السيارة
 */
export const getMyBookings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return await Promise.all(
      bookings.map(async (b) => {
        const car = await ctx.db.get(b.carId);
        return { ...b, car };
      })
    );
  },
});

/**
 * تحديث حالة الحجز (للمسؤولين فقط)
 */
export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("غير مصرح");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role === "viewer") throw new Error("لا تملك صلاحية الإدارة");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("الحجز غير موجود");

    await ctx.db.patch(args.bookingId, { status: args.status });

    // تسجيل التعديل في السجلات
    await ctx.db.insert("activity_logs", {
        action: `BOOKING_${args.status.toUpperCase()}`,
        details: `تم ${args.status === "confirmed" ? "تأكيد" : "إلغاء"} الحجز رقم ${args.bookingId}`,
        userId: user._id,
        timestamp: Date.now()
    });
    
    return { success: true };
  },
});