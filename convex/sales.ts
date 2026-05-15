/**
 * المسار: convex/sales.ts
 * الوظيفة: إتمام صفقات البيع، توليد أرقام الفواتير، والتحقق من القواعد المالية.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth";

export const createSale = mutation({
  args: { 
    carId: v.id("cars"), 
    bookingId: v.optional(v.id("bookings")), // إضافة الحقل المفقود في الـ Validator
    customerName: v.string(), 
    phone: v.string(), 
    address: v.optional(v.string()),
    identityNum: v.optional(v.string()),
    amountPaid: v.number(), 
    taxAmount: v.optional(v.number()),
    registrationFees: v.optional(v.number()),
    vin: v.optional(v.string()),
    mileageAtSale: v.optional(v.number()),
    paymentMethod: v.union(v.literal("Cash"), v.literal("Bank Transfer"), v.literal("Card"), v.literal("Check")),
    token: v.string() // Token should not be optional for authenticated mutations
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("غير مصرح لك.");

    // صلاحيات الأدمن أو مدير المبيعات فقط
    if (user.role !== "admin" && user.role !== "sales_manager") throw new Error("لا تملك صلاحية البيع.");

    const car = await ctx.db.get(args.carId);
    if (!car || (car.status !== "Available" && car.status !== "Reserved") || car.isArchived) throw new Error("السيارة غير متاحة للبيع");

    if (args.amountPaid < car.price * 0.8) throw new Error("المبلغ أقل من الحد الأدنى المسموح به");

    const now = Date.now();
    
    // نظام ترقيم تسلسلي احترافي يعتمد على عدد العمليات في السنة الحالية
    const currentYear = new Date().getFullYear();
    const salesThisYear = await ctx.db.query("sales").collect(); // في نظام إنتاجي نستخدم Index للسنوات
    const sequence = (salesThisYear.length + 1).toString().padStart(4, '0');
    const invoiceNumber = `INV-${currentYear}-${sequence}`;

    const customer = await ctx.db.query("customers").withIndex("by_phone", (q) => q.eq("phone", args.phone)).unique();
    
    // إصلاح خطأ undefined عبر التأكد من وجود القيمة دائماً
    let customerId;
    if (!customer) {
      customerId = await ctx.db.insert("customers", { 
        fullName: args.customerName, 
        phone: args.phone, 
        email: "", 
        address: args.address || "",
        identityNum: args.identityNum || "",
        status: "خالص", 
        totalPurchases: args.amountPaid, 
        createdAt: now, 
        updatedAt: now 
      });
    } else {
      customerId = customer._id;
      // تحديث إجمالي المشتريات للزبون الحالي
      await ctx.db.patch(customerId, {
        totalPurchases: (customer.totalPurchases || 0) + args.amountPaid,
        updatedAt: now
      });
    }

    await ctx.db.patch(args.carId, { status: "Sold", updatedAt: now });

    // تحديد الحجز المراد تأكيده: نستخدم المعرف المباشر إذا توفر، أو نبحث عن أول حجز معلق
    let pendingBooking;
    if (args.bookingId) {
      pendingBooking = await ctx.db.get(args.bookingId);
    } else {
      pendingBooking = await ctx.db
        .query("bookings")
        .withIndex("by_car", (q) => q.eq("carId", args.carId))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .first(); // استخدام first بدلاً من unique لتجنب الانهيار في حال وجود عدة طلبات
    }

    if (pendingBooking) {
      await ctx.db.patch(pendingBooking._id, { status: "confirmed", updatedAt: now });
      
      // إرسال إشعار للزبون الذي قام بالحجز الأصلي
      await ctx.db.insert("notifications", {
        userId: pendingBooking.userId,
        title: "تم تأكيد طلبك 🎉",
        message: `مبارك! تم تأكيد شرائك لسيارة ${car.make} ${car.model}. شكراً لثقتك بنا.`,
        type: "success",
        priority: "high",
        isRead: false,
        actionUrl: "/my-bookings", // توحيد الحقل
        createdAt: now,
      });
    }
    
    const saleId = await ctx.db.insert("sales", {
      invoiceNumber,
      carId: args.carId,
      bookingId: args.bookingId || pendingBooking?._id, // حفظ رابط الحجز في سجل البيع
      customerId: customerId, // الآن TypeScript متأكد أن المعرف متاح
      userId: pendingBooking?.userId, // ربط الفاتورة بالمستخدم صاحب الحجز
      sellerId: user._id, 
      saleDate: now, 
      amountPaid: args.amountPaid, 
      taxAmount: args.taxAmount || 0,
      registrationFees: args.registrationFees || 0,
      subtotal: args.amountPaid - (args.taxAmount || 0) - (args.registrationFees || 0),
      vin: args.vin || "",
      mileageAtSale: args.mileageAtSale || car.mileage,
      paymentMethod: args.paymentMethod, 
      isArchived: false,
      createdAt: now, 
      updatedAt: now,
    });

    await ctx.db.insert("notifications", { title: "بيع ناجح ✅", message: `تم بيع ${car.make} لـ ${args.customerName}`, type: "success", priority: "medium", isRead: false, createdAt: now });
    await ctx.db.insert("activity_logs", { action: "SALE_CREATED", details: `فاتورة ${invoiceNumber}`, userId: user._id, timestamp: now });

    return saleId;
  },
});

/**
 * أرشفة أو استعادة عملية بيع
 */
export const toggleSaleArchive = mutation({
  args: { token: v.string(), saleId: v.id("sales") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") throw new Error("للأدمن فقط.");

    const sale = await ctx.db.get(args.saleId);
    if (!sale) throw new Error("العملية غير موجودة");

    await ctx.db.patch(args.saleId, { isArchived: !sale.isArchived, updatedAt: Date.now() });
  },
});

/**
 * جلب المبيعات الأخيرة مع تفاصيل السيارة والزبون للعرض في لوحة التحكم
 */
export const getRecentSales = query({
  args: { token: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    
    let salesQuery = ctx.db.query("sales");

    // إذا كان مدير مبيعات، يرى مبيعاته فقط
    if (user?.role === "sales_manager") {
      salesQuery = salesQuery.filter((q) => q.eq(q.field("sellerId"), user._id));
    }

    const sales = await salesQuery.order("desc").take(args.limit ?? 100);

    return await Promise.all(
      sales.map(async (sale) => {
        const car = await ctx.db.get(sale.carId);
        const customer = await ctx.db.get(sale.customerId);
        const seller = await ctx.db.get(sale.sellerId);

        // حساب الضريبة والرسوم في حال كانت مفقودة للبيانات القديمة
        return {
          ...sale,
          carName: car ? `${car.make} ${car.model}` : "سيارة محذوفة",
          customerName: customer?.fullName || "زبون غير معروف",
          vin: sale.vin || car?.vin || "---",
          mileageAtSale: sale.mileageAtSale || car?.mileage || 0,
          subtotal: sale.subtotal || (sale.amountPaid * 0.81), // افتراضي 19%
          taxAmount: sale.taxAmount || (sale.amountPaid * 0.19),
          profit: sale.amountPaid - (car?.purchasePrice || 0),
          phone: customer?.phone,
          address: customer?.address,
          email: customer?.email,
          identityNum: customer?.identityNum,
          sellerName: seller?.fullName || "موظف سابق",
        };
      })
    );
  },
});