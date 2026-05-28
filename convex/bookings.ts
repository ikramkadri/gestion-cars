import { query, mutation, internalAction, internalMutation, QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getAuthenticatedUser } from "./auth"; // Import getAuthenticatedUser
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
    guestName: v.optional(v.string()), 
    customerPhone: v.string(),
    customerLocation: v.string(),
    message: v.optional(v.string()),
    inspectionDate: v.optional(v.number()),
    bookingSource: v.optional(v.union(v.literal("website"), v.literal("whatsapp"), v.literal("phone_call"), v.literal("facebook"))),
  },
  handler: async (ctx: MutationCtx, args: {
    carId: Id<"cars">;
    token?: string;
    guestName?: string;
    customerPhone: string;
    customerLocation: string;
    message?: string;
    inspectionDate?: number;
    bookingSource?: "website" | "whatsapp" | "phone_call" | "facebook";
  }) => {
    const user = await getAuthenticatedUser(ctx, args.token);

    // 1. تأمين البيانات: إذا كان المستخدم مسجلاً، نفضل استخدام بياناته الموثقة
    const phone = user?.phone || args.customerPhone;
    const location = user?.address || args.customerLocation;
    const fullName = user?.fullName || args.guestName || "عميل غير معروف";

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
      carId: args.carId,
      userId: user?._id, 
      bookingDate: now, 
      bookingReference: reference,
      guestName: user ? undefined : args.guestName, // لا نحتاج لاسم ضيف إذا كان هناك userId
      customerPhone: phone,
      inspectionDate: args.inspectionDate,
      customerLocation: location,
      message: args.message,
      status: "pending",
      verificationMethod: "phone_call", // الافتراضي في الجزائر
      bookingSource: args.bookingSource ?? "website",
      createdAt: now, // تغيير التاريخ إلى رقم (Timestamp)
      updatedAt: now, // حقل مطلوب في الـ Schema
    });

    // جلب تفاصيل السيارة لإنشاء رسالة الإشعار
    const car = await ctx.db.get(args.carId);
    const carName = car ? `${car.make} ${car.model}` : "سيارة غير معروفة";
    const formattedDate = args.inspectionDate ? new Date(args.inspectionDate).toLocaleDateString('ar-DZ') : "لم يحدد";

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
  handler: async (ctx: QueryCtx, args: { carId: Id<"cars"> }) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_car", (q) => q.eq("carId", args.carId))
      .filter((q) => q.or(q.eq(q.field("status"), "pending"), q.eq(q.field("status"), "confirmed")))
      .first();

    if (!booking) return null;
    
    const client = booking.userId ? await ctx.db.get(booking.userId) : null;
    return { ...booking, clientDetails: client };
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
  handler: async (ctx: ActionCtx, args) => {
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
  handler: async (ctx: QueryCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
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
  handler: async (ctx: QueryCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
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
  handler: async (ctx: MutationCtx, args) => {
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
  handler: async (ctx: MutationCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || (user.role !== "admin" && user.role !== "sales_manager")) throw new Error("غير مصرح لك.");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("الحجز غير موجود.");

    await ctx.db.patch(args.bookingId, { status: "confirmed", updatedAt: Date.now() });

    const car = await ctx.db.get(booking.carId);
    const customer = booking.userId ? await ctx.db.get(booking.userId) : null;

    // إذا تم قبول الحجز، نغير حالة السيارة إلى "محجوزة" لمنع تداخل المبيعات
    await ctx.db.patch(booking.carId, {
      status: "Reserved",
      updatedAt: Date.now()
    });

    const carName = car ? `${car.make} ${car.model}` : "السيارة";
    const customerEmail = customer?.email; // البريد الإلكتروني للمستخدم المسجل
    const customerName = customer?.fullName || booking.guestName || "العميل"; // اسم الزبون من المستخدم أو الضيف

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
  handler: async (ctx: MutationCtx, args) => {
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
      const customer = booking.userId ? await ctx.db.get(booking.userId) : null;

      const carName = car ? `${car.make} ${car.model}` : "السيارة";
      const customerEmail = customer?.email; // البريد الإلكتروني للمستخدم المسجل
      const customerName = customer?.fullName || booking.guestName || "العميل"; // اسم الزبون من المستخدم أو الضيف

      // إرسال إشعار الرفض للزبون فقط إذا كان يملك حساباً
      if (booking.userId) {
        await ctx.db.insert("notifications", {
          userId: booking.userId,
          title: "تحديث بخصوص حجزك ⚠️",
          message: `نعتذر منك، تم رفض طلب الحجز للسبب التالي: ${args.reason}`,
          type: "warning",
          priority: "medium",
          isRead: false,
          actionUrl: "/my-bookings",
          createdAt: Date.now()
        });
      }

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