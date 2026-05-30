import { query, mutation, internalMutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth"; // Import getAuthenticatedUser

/**
 * دالة حجز سيارة للمعاينة
 * يتم استدعاؤها من مكون CarCard
 */
export const reserveCar = mutation({
  args: {
    carId: v.id("cars"),
    token: v.optional(v.string()), // إضافة التوكن للتحقق من الهوية
    guestName: v.optional(v.string()), 
    customerPhone: v.string(),
    customerLocation: v.string(),
    message: v.optional(v.string()),
    inspectionDate: v.optional(v.number()),
    bookingSource: v.optional(v.union(v.literal("website"), v.literal("whatsapp"), v.literal("phone_call"), v.literal("facebook"))),
  },
  handler: async (ctx, {
    carId,
    token,
    guestName,
    customerPhone,
    customerLocation,
    message,
    inspectionDate,
    bookingSource
  }) => {
    const user = await getAuthenticatedUser(ctx, token);

    // 0. التحقق من حالة السيارة: لا يمكن حجز سيارة محجوزة أو مباعة
    const car = await ctx.db.get(carId);
    if (!car || car.status !== "Available") {
      throw new Error("عذراً، هذه السيارة لم تعد متاحة للحجز (محجوزة أو مباعة بالفعل).");
    }

    // 1. تأمين البيانات: إذا كان المستخدم مسجلاً، نفضل استخدام بياناته الموثقة
    const phone = user?.phone || customerPhone;
    const location = user?.address || customerLocation;
    const fullName = user?.fullName || guestName || "عميل غير معروف";

    if (!phone) {
      throw new Error("رقم الهاتف ضروري لإتمام الحجز.");
    }

    // 2. التحقق من القائمة السوداء (Security First)
    const blocked = await ctx.db
      .query("blocked_phones")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .unique();

    if (blocked) {
      throw new Error("عذراً، هذا الرقم محظور من إجراء الحجوزات. يرجى الاتصال بالإدارة.");
    }

    const now = Date.now();
    const reference = `MTX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    const bookingId = await ctx.db.insert("bookings", {
      carId: carId,
      userId: user?._id, 
      bookingDate: now, 
      bookingReference: reference,
      guestName: user ? undefined : guestName, // لا نحتاج لاسم ضيف إذا كان هناك userId
      customerPhone: phone,
      inspectionDate: inspectionDate,
      customerLocation: location,
      message: message,
      status: "pending",
      verificationMethod: "phone_call", // الافتراضي في الجزائر
      bookingSource: bookingSource ?? "website",
      createdAt: now, // تغيير التاريخ إلى رقم (Timestamp)
      updatedAt: now, // حقل مطلوب في الـ Schema
    });

    // جلب تفاصيل السيارة لإنشاء رسالة الإشعار
    const carName = car ? `${car.make} ${car.model}` : "سيارة غير معروفة";
    const formattedDate = inspectionDate ? new Date(inspectionDate).toLocaleDateString('ar-DZ') : "لم يحدد";

    // نظام الإشعارات العالمي: إرسال تنبيه فوري للإدارة مع رابط مباشر
    await ctx.db.insert("notifications", {
      title: "طلب حجز جديد 🚗",
      message: `طلب من ${fullName} على ${carName}. الموعد: ${formattedDate}. المرجع: ${reference}`,
      type: "reservation", // استخدام التصنيف الصحيح
      priority: "high",
      actionUrl: `/admin/bookings?id=${bookingId}`,
      isRead: false,
      createdAt: now,
    });

    return bookingId;
  },
});

/**
 * جلب الحجز النشط لسيارة محددة (لأتمتة عملية البيع من المخزن)
 */
export const getActiveBookingForCar = query({
  args: { carId: v.id("cars") },
  handler: async (ctx, { carId }) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_car", (q) => q.eq("carId", carId))
      .filter((q) => q.or(q.eq(q.field("status"), "pending"), q.eq(q.field("status"), "confirmed")))
      .first();

    if (!booking) return null;
    
    const client = booking.userId ? await ctx.db.get(booking.userId) : null;
    return { ...booking, clientDetails: client };
  },
});

/**
 * جلب حجوزات المستخدم الحالي (للزباين)
 */
export const getMyBookings = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    const user = await getAuthenticatedUser(ctx, token);
    if (!user) return [];

    // فلترة صارمة: الزبون يرى فقط الحجوزات المرتبطة بمعرفه الرقمي (userId)
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc") // الأحدث أولاً
      .collect();

    return await Promise.all(
      bookings.map(async (booking) => {
        const car = await ctx.db.get(booking.carId);
        return { ...booking, carDetails: car, clientDetails: booking.userId ? await ctx.db.get(booking.userId) : null };
      })
    );
  },
});

/**
 * جلب الحجوزات المعلقة (للإدارة)
 */
export const getPendingBookings = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getAuthenticatedUser(ctx, token);
    if (!user || (user.role !== "admin" && user.role !== "sales_manager")) {
      throw new Error("غير مصرح لك.");
    }

    const allBookings = await ctx.db
      .query("bookings")
      .filter((q) => q.or(q.eq(q.field("status"), "pending"), q.eq(q.field("status"), "confirmed")))
      .order("desc")
      .collect();

    return await Promise.all(
      allBookings.map(async (booking) => {
        const car = await ctx.db.get(booking.carId);
        const client = booking.userId ? await ctx.db.get(booking.userId) : null; // يمكن أن يكون null إذا كان ضيفاً
        return { ...booking, carDetails: car, clientDetails: client };
      })
    );
  },
});

/**
 * إلغاء حجز
 */
export const cancelBooking = mutation({
  args: { token: v.string(), bookingId: v.id("bookings") },
  handler: async (ctx, { token, bookingId }) => {
    const user = await getAuthenticatedUser(ctx, token);
    if (!user) throw new Error("يجب تسجيل الدخول.");

    const booking = await ctx.db.get(bookingId);
    if (!booking) throw new Error("الحجز غير موجود.");

    await ctx.db.patch(bookingId, { status: "cancelled", updatedAt: Date.now() });
  },
});

/**
 * قبول حجز (تأكيده)
 */
export const approveBooking = mutation({
  args: { token: v.string(), bookingId: v.id("bookings") },
  handler: async (ctx, { token, bookingId }) => {
    const user = await getAuthenticatedUser(ctx, token);
    if (!user || (user.role !== "admin" && user.role !== "sales_manager")) throw new Error("غير مصرح لك.");

    const booking = await ctx.db.get(bookingId);
    if (!booking) throw new Error("الحجز غير موجود.");

    await ctx.db.patch(bookingId, { status: "confirmed", updatedAt: Date.now() });

    const car = await ctx.db.get(booking.carId);

    // إذا تم قبول الحجز، نغير حالة السيارة إلى "محجوزة" لمنع تداخل المبيعات
    await ctx.db.patch(booking.carId, {
      status: "Reserved",
      updatedAt: Date.now()
    });

    const carName = car ? `${car.make} ${car.model}` : "السيارة";

    // إرسال إشعار للنظام الداخلي فقط إذا كان الزبون مسجلاً، لتجنب ظهوره للأدمن كإشعار موجه لنفسه
    if (booking.userId) {
      await ctx.db.insert("notifications", {
        userId: booking.userId,
        title: "تم قبول طلب حجزك ✅",
        message: `تمت الموافقة على طلب حجزك لسيارة ${carName}. يمكنك الآن التوجه للمعرض لإتمام الإجراءات.`,
        type: "success",
        priority: "high",
        isRead: false,
        actionUrl: "/my-bookings",
        createdAt: Date.now(),
      });
    }
  },
});

/**
 * رفض حجز مع ذكر السبب
 */
export const rejectBooking = mutation({
  args: { token: v.string(), bookingId: v.id("bookings"), reason: v.string() },
  handler: async (ctx, { token, bookingId, reason }) => {
    const user = await getAuthenticatedUser(ctx, token);
    if (!user || (user.role !== "admin" && user.role !== "sales_manager")) throw new Error("غير مصرح لك.");

    await ctx.db.patch(bookingId, { 
      status: "rejected", 
      rejectionReason: reason,
      updatedAt: Date.now() 
    });

    const booking = await ctx.db.get(bookingId);

    if (booking) {
      // إرسال إشعار الرفض للزبون فقط إذا كان يملك حساباً
      if (booking.userId) {
        await ctx.db.insert("notifications", {
          userId: booking.userId,
          title: "تحديث بخصوص حجزك ⚠️",
          message: `نعتذر منك، تم رفض طلب الحجز للسبب التالي: ${reason}`,
          type: "warning",
          priority: "medium",
          isRead: false,
          actionUrl: "/my-bookings",
          createdAt: Date.now()
        });
      }
    }
  },
});

/**
 * دالة داخلية لأرشفة الحجوزات القديمة (الملغاة أو المرفوضة)
 * تُستدعى بواسطة Cron Job
 */
export const archiveOldBookings = internalMutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const oldBookings = await ctx.db
      .query("bookings")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", ninetyDaysAgo))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "cancelled"),
          q.eq(q.field("status"), "rejected")
        )
      )
      .collect();

    for (const booking of oldBookings) await ctx.db.delete(booking._id);
    console.log(`[Cleanup] Deleted ${oldBookings.length} old cancelled/rejected bookings.`);
  },
});