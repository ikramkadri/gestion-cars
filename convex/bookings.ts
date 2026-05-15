import { v } from "convex/values";
import { mutation, query, internalMutation, internalAction } from "./_generated/server";
import { getAuthenticatedUser } from "./auth";
import { internal } from "./_generated/api"; // استيراد internal لاستدعاء الدوال الداخلية

/** تعريف لمتغيرات البيئة لتجنب أخطاء TypeScript و ESLint */
declare const process: {
  env: {
    CONVEX_APP_URL?: string;
    [key: string]: string | undefined;
  };
};

/**
 * دالة حجز سيارة للمعاينة
 * يتم استدعاؤها من مكون CarCard
 */
export const reserveCar = mutation({
  args: {
    carId: v.id("cars"),
    token: v.optional(v.string()), // إضافة التوكن للتحقق من الهوية
  },
  handler: async (ctx, args) => {
    // استخدام نظام المصادقة الخاص بك لجلب المستخدم الحقيقي من جدول users
    const user = await getAuthenticatedUser(ctx, args.token);
    
    if (!user) {
      throw new Error("يجب تسجيل الدخول لإرسال طلب حجز.");
    }

    const now = Date.now();
    
    const bookingId = await ctx.db.insert("bookings", {
      carId: args.carId,
      userId: user._id, // الآن النوع مطابق Id<"users">
      bookingDate: now, // حقل مطلوب في الـ Schema
      status: "pending",
      createdAt: now, // تغيير التاريخ إلى رقم (Timestamp)
      updatedAt: now, // حقل مطلوب في الـ Schema
    });

    // جلب تفاصيل السيارة لإنشاء رسالة الإشعار
    const car = await ctx.db.get(args.carId);
    const carName = car ? `${car.make} ${car.model}` : "سيارة غير معروفة";

    // إرسال إشعار داخلي لمديري المبيعات
    await ctx.runMutation(internal.bookings.sendNewBookingNotificationToManagers, {
      carName,
      customerName: user.fullName,
      bookingId,
    });

    return bookingId;
  },
});

/**
 * دالة داخلية لإرسال إشعار بوجود حجز جديد لمديري المبيعات.
 * لا يمكن استدعاؤها مباشرة من الواجهة الأمامية.
 */
export const sendNewBookingNotificationToManagers = internalMutation({
  args: {
    carName: v.string(),
    customerName: v.string(),
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const managers = await ctx.db
      .query("users")
      .filter((q) => q.or(q.eq(q.field("role"), "admin"), q.eq(q.field("role"), "sales_manager")))
      .collect();

    const now = Date.now();

    for (const manager of managers) {
      await ctx.db.insert("notifications", {
        userId: manager._id,
        title: "طلب حجز جديد 🔔",
        message: `قام ${args.customerName} بطلب حجز لسيارة ${args.carName}.`,
        type: "info",
        isRead: false,
        createdAt: now,
        // يمكن إضافة رابط لصفحة الحجز في لوحة التحكم
        link: `/admin/bookings?bookingId=${args.bookingId}`,
      });
    }
  },
});

/**
 * دالة داخلية لإرسال بريد إلكتروني للزبون عند تحديث حالة الحجز.
 * لا يمكن استدعاؤها مباشرة من الواجهة الأمامية.
 */
export const sendBookingEmail = internalAction({
  args: {
    toEmail: v.string(),
    customerName: v.string(),
    carName: v.string(),
    status: v.union(v.literal("confirmed"), v.literal("rejected")),
    bookingLink: v.string(),
    reason: v.optional(v.string()), // لسبب الرفض
  },
  handler: async (ctx, args) => {
    console.log(`Sending email to: ${args.toEmail}`);
    console.log(`Subject: طلب حجز سيارة ${args.status === "confirmed" ? "تم قبوله" : "تم رفضه"}`);
    console.log(`Body: مرحباً ${args.customerName},`);
    console.log(`   طلب حجزك لسيارة ${args.carName} ${args.status === "confirmed" ? "تم قبوله." : "تم رفضه."}`);
    if (args.status === "rejected" && args.reason) {
      console.log(`   السبب: ${args.reason}`);
    }
    console.log(`   يمكنك مراجعة تفاصيل الحجز هنا: ${args.bookingLink}`);
    console.log("   شكراً لك.");

    // هنا يمكنك دمج خدمة إرسال البريد الإلكتروني الفعلية (مثل SendGrid, Mailgun, Nodemailer)
    // مثال (افتراضي):
    /*
    const response = await fetch("https://api.emailservice.com/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.EMAIL_SERVICE_API_KEY}` },
      body: JSON.stringify({ to: args.toEmail, from: "no-reply@motorix.com", subject: `طلب حجز سيارة ${args.status === "confirmed" ? "تم قبوله" : "تم رفضه"}`, html: `<p>مرحباً ${args.customerName},</p><p>طلب حجزك لسيارة <strong>${args.carName}</strong> ${args.status === "confirmed" ? "تم قبوله." : "تم رفضه."}</p>${args.status === "rejected" && args.reason ? `<p>السبب: ${args.reason}</p>` : ""}<p>يمكنك مراجعة تفاصيل الحجز هنا: <a href="${args.bookingLink}">صفحة حجوزاتي</a></p><p>شكراً لك.</p>`, }),
    });
    if (!response.ok) { const errorText = await response.text(); console.error("Failed to send email:", errorText); throw new Error("Failed to send email notification."); }
    */
  },
});

/**
 * جلب حجوزات المستخدم الحالي (للزباين)
 */
export const getMyBookings = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) return [];

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      bookings.map(async (booking) => {
        const car = await ctx.db.get(booking.carId);
        return { ...booking, carDetails: car };
      })
    );
  },
});

/**
 * جلب الحجوزات المعلقة (للإدارة)
 */
export const getPendingBookings = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || (user.role !== "admin" && user.role !== "sales_manager")) {
      throw new Error("غير مصرح لك.");
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    return await Promise.all(
      bookings.map(async (booking) => {
        const car = await ctx.db.get(booking.carId);
        const client = await ctx.db.get(booking.userId);
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
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("يجب تسجيل الدخول.");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("الحجز غير موجود.");

    await ctx.db.patch(args.bookingId, { status: "cancelled", updatedAt: Date.now() });
  },
});

/**
 * قبول حجز (تأكيده)
 */
export const approveBooking = mutation({
  args: { token: v.string(), bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || (user.role !== "admin" && user.role !== "sales_manager")) throw new Error("غير مصرح لك.");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("الحجز غير موجود.");

    await ctx.db.patch(args.bookingId, { status: "confirmed", updatedAt: Date.now() });

    const car = await ctx.db.get(booking.carId);
    const customer = await ctx.db.get(booking.userId);

    const carName = car ? `${car.make} ${car.model}` : "السيارة";
    const customerEmail = customer?.email;
    const customerName = customer?.fullName || "العميل";

    await ctx.db.insert("notifications", {
      userId: booking.userId,
      title: "تم قبول طلب حجزك ✅",
      message: `تمت الموافقة على طلب حجزك لسيارة ${carName}. يمكنك الآن التوجه للمعرض لإتمام الإجراءات.`,
      type: "success",
      isRead: false,
      link: "/admin/bookings",
      createdAt: Date.now(),
    });

    // إرسال بريد إلكتروني للزبون
    if (customerEmail) {
      await ctx.scheduler.runAfter(0, internal.bookings.sendBookingEmail, {
        toEmail: customerEmail,
        customerName: customerName,
        carName: carName,
        status: "confirmed",
        bookingLink: `${process.env.CONVEX_APP_URL ?? ""}/admin/bookings`, // رابط صفحة حجوزات الزبون
      });
    }
  },
});

/**
 * رفض حجز مع ذكر السبب
 */
export const rejectBooking = mutation({
  args: { token: v.string(), bookingId: v.id("bookings"), reason: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || (user.role !== "admin" && user.role !== "sales_manager")) throw new Error("غير مصرح لك.");

    await ctx.db.patch(args.bookingId, { 
      status: "rejected", 
      rejectionReason: args.reason,
      updatedAt: Date.now() 
    });

    const booking = await ctx.db.get(args.bookingId);

    if (booking) {
      const car = await ctx.db.get(booking.carId);
      const customer = await ctx.db.get(booking.userId);

      const carName = car ? `${car.make} ${car.model}` : "السيارة";
      const customerEmail = customer?.email;
      const customerName = customer?.fullName || "العميل";

      await ctx.db.insert("notifications", {
        userId: booking.userId,
        title: "تحديث بخصوص حجزك ⚠️",
        message: `نعتذر منك، تم رفض طلب الحجز للسبب التالي: ${args.reason}`,
        type: "error", 
        isRead: false, 
        link: "/admin/bookings",
        createdAt: Date.now()
      });

      // إرسال بريد إلكتروني للزبون
      if (customerEmail) {
        await ctx.scheduler.runAfter(0, internal.bookings.sendBookingEmail, {
          toEmail: customerEmail,
          customerName: customerName,
          carName: carName,
          status: "rejected",
          bookingLink: `${process.env.CONVEX_APP_URL ?? ""}/admin/bookings`, // رابط صفحة حجوزات الزبون
          reason: args.reason,
        });
      }
    }
  },
});