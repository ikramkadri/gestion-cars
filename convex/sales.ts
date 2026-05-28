/**
 * المسار: convex/sales.ts
 * الوظيفة: إتمام صفقات البيع، توليد أرقام الفواتير، والتحقق من القواعد المالية.
 */

import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { getAuthenticatedUser } from "./auth";

export const createSale = mutation({
  args: { 
    carId: v.id("cars"), 
    bookingId: v.optional(v.id("bookings")), // إضافة الحقل المفقود في الـ Validator
    customerName: v.string(), 
    phone: v.string(), 
    address: v.string(),
    identityNum: v.string(),
    amountPaid: v.number(), 
    taxAmount: v.optional(v.number()),
    registrationFees: v.optional(v.number()),
    vin: v.optional(v.string()),
    mileageAtSale: v.optional(v.number()),
    paymentMethod: v.union(v.literal("Cash"), v.literal("Bank Transfer"), v.literal("Card"), v.literal("Check")),
    token: v.string() // Token should not be optional for authenticated mutations
  },
  handler: async (ctx: MutationCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("غير مصرح لك.");

    // منع إدخال نصوص فارغة برمجياً
    if (!args.customerName.trim()) throw new Error("اسم الزبون لا يمكن أن يكون فارغاً.");
    if (!args.phone.trim()) throw new Error("رقم الهاتف لا يمكن أن يكون فارغاً.");
    if (!args.address.trim()) throw new Error("العنوان مطلوب.");
    if (!args.identityNum.trim()) throw new Error("رقم الهوية NIN مطلوب.");

    // صلاحيات الأدمن أو مدير المبيعات فقط
    if (user.role !== "admin" && user.role !== "sales_manager") throw new Error("لا تملك صلاحية البيع.");

    const car = await ctx.db.get(args.carId);
    if (!car || (car.status !== "Available" && car.status !== "Reserved") || car.isArchived) throw new Error("السيارة غير متاحة للبيع");

    if (args.amountPaid < car.price) throw new Error("عذراً، يجب دفع كامل مبلغ السيارة (100%) لإتمام عملية البيع وإصدار الفاتورة.");

    const now = Date.now();
    
    // تحسين الأداء: جلب آخر عملية بيع فقط لتوليد الرقم التالي بدلاً من جلب الكل
    const currentYear = new Date().getFullYear();
    const lastSale = await ctx.db.query("sales").order("desc").first();
    const lastSequence = lastSale?.invoiceNumber?.split('-')[2] || "0000";
    const sequence = (parseInt(lastSequence) + 1).toString().padStart(4, '0');
    const invoiceNumber = `INV-${currentYear}-${sequence}`;

    const customer = await ctx.db.query("customers").withIndex("by_phone", (q) => q.eq("phone", args.phone)).unique();
    
    if (!customer) {
      throw new Error("عذراً، هذا الزبون غير مسجل في النظام. يجب فتح حساب للزبون أولاً أو إضافته في قاعدة بيانات الزبائن برقم الهاتف هذا قبل إتمام عملية البيع لضمان التتبع القانوني.");
    }

    const customerId = customer._id;
    // تحديث إجمالي المشتريات للزبون الحالي
    await ctx.db.patch(customerId, {
      totalPurchases: (customer.totalPurchases || 0) + args.amountPaid,
      updatedAt: now
    });

    await ctx.db.patch(args.carId, { status: "Sold", updatedAt: now });

    // تحديد الحجز المراد تأكيده: نستخدم المعرف المباشر إذا توفر، أو نبحث عن أول حجز معلق
    // إصلاح أمني: البحث عن الحجز الذي يطابق السيارة ورقم هاتف المشتري حصراً
    const pendingBooking = args.bookingId 
      ? await ctx.db.get(args.bookingId) 
      : await ctx.db
          .query("bookings")
          .withIndex("by_car", (q) => q.eq("carId", args.carId))
          .filter((q) => 
            q.and(
              // التعديل: دعم الحجوزات التي تم تأكيد معاينتها مسبقاً
              q.or(
                q.eq(q.field("status"), "pending"),
                q.eq(q.field("status"), "confirmed")
              ),
              q.eq(q.field("customerPhone"), args.phone)
            )
          )
          .first();

    if (pendingBooking) {
      // بعد البيع، نحول الحجز إلى حالة نهائية لكي لا يظهر في القوائم النشطة
      await ctx.db.patch(pendingBooking._id, { status: "archived", updatedAt: now });
      
      if (pendingBooking.userId) {
        // إرسال إشعار للزبون الذي قام بالحجز الأصلي (فقط إذا كان مسجلاً)
        await ctx.db.insert("notifications", {
          userId: pendingBooking.userId,
          title: "تم تأكيد طلبك 🎉",
          message: `مبارك! تم تأكيد شرائك لسيارة ${car.make} ${car.model}. شكراً لثقتك بنا.`,
          type: "success",
          priority: "high",
          isRead: false,
          actionUrl: "/my-bookings", 
          createdAt: now,
        });
      }
    }
    
    const saleId = await ctx.db.insert("sales", {
      invoiceNumber,
      customerName: args.customerName, // Populate denormalized field
      carName: car.make + " " + car.model, // Populate denormalized field
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
      deliveryStatus: "processed",
      isArchived: false,
      createdAt: now, 
      updatedAt: now,
    });

    await ctx.db.insert("notifications", { title: "بيع ناجح ✅", message: `تم بيع ${car.make} لـ ${args.customerName}`, type: "success", priority: "medium", isRead: false, createdAt: now });
    await ctx.db.insert("activity_logs", { action: "SALE_CREATED", details: `فاتورة ${invoiceNumber}`, userId: user._id, createdAt: now });

    return saleId;
  },
});

/**
 * أرشفة أو استعادة عملية بيع
 */
export const toggleSaleArchive = mutation({
  args: { token: v.string(), saleId: v.id("sales") },
  handler: async (ctx: MutationCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") throw new Error("للأدمن فقط.");

    const sale = await ctx.db.get(args.saleId);
    if (!sale) throw new Error("العملية غير موجودة");

    await ctx.db.patch(args.saleId, { isArchived: !sale.isArchived, updatedAt: Date.now() });
  },
});

/**
 * تحديث حالة تتبع النقل (للأدمن ومدراء المبيعات)
 */
export const updateDeliveryStatus = mutation({
  args: { 
    token: v.string(), 
    saleId: v.id("sales"), 
    status: v.union(v.literal("processed"), v.literal("quality_check"), v.literal("shipped"), v.literal("delivered")) 
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || (user.role !== "admin" && user.role !== "sales_manager")) throw new Error("صلاحية مطلوبة.");

    const sale = await ctx.db.get(args.saleId);
    if (!sale) throw new Error("عملية البيع غير موجودة");

    await ctx.db.patch(args.saleId, { deliveryStatus: args.status, updatedAt: Date.now() });

    // إرسال إشعار فوري للزبون عند تحديث رحلة السيارة
    if (sale.userId) {
      await ctx.db.insert("notifications", {
        userId: sale.userId,
        title: "تحديث تتبع النقل 🚚",
        message: `تم تحديث حالة توصيل سيارتك إلى: ${
          args.status === "quality_check" ? "فحص الجودة النهائي" : 
          args.status === "shipped" ? "في الطريق إليك" : 
          args.status === "delivered" ? "تم التسليم بنجاح" : "تجهيز الوثائق"
        }`,
        type: "info",
        isRead: false,
        createdAt: Date.now(),
      });
    }
  },
});

/**
 * جلب المبيعات الأخيرة مع تفاصيل السيارة والزبون للعرض في لوحة التحكم
 */
export const getRecentSales = query({
  args: { token: v.optional(v.string()), limit: v.optional(v.number()), searchTerm: v.optional(v.string()), isArchived: v.optional(v.boolean()) },
  handler: async (ctx: QueryCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    
    if (!user) return []; 

    let salesQuery = ctx.db.query("sales");

    // نظام تصفية الصلاحيات المطور
    if (user.role === "admin") { // الأدمن يرى كل المبيعات
      // No additional filter needed here
    } else if (user.role === "sales_manager") { // مدير المبيعات يرى مبيعاته التي قام بها فقط
      salesQuery = salesQuery.filter((q) => q.eq(q.field("sellerId"), user._id));
    } else {
      // الزبون يرى المبيعات المرتبطة بـ معرفه أو برقم هاتفه (لضمان ظهور المبيعات اليدوية)
      salesQuery = salesQuery.filter((q) => 
        q.or(
          q.eq(q.field("userId"), user._id),
          // يمكنك إضافة تصفية بالهاتف هنا إذا كان مخزناً في جدول sales مباشرة
        )
      );
    }

    // تصفية حسب حالة الأرشفة
    if (args.isArchived !== undefined) {
      salesQuery = salesQuery.filter((q) => q.eq(q.field("isArchived"), args.isArchived));
    }

    let sales: Doc<"sales">[];

    // تصفية المبيعات حسب البحث
    if (args.searchTerm) {
      sales = await ctx.db
        .query("sales")
        .withSearchIndex("search_sales", (q) =>
          q.search("customerName", args.searchTerm!).eq("isArchived", args.isArchived ?? false)
        ).take(args.limit ?? 100);

      // تطبيق فلترة الصلاحيات يدوياً بعد البحث (لأن Search Index لا يدعم الفلترة المتقدمة)
      if (user.role === "sales_manager") {
        sales = sales.filter((s) => s.sellerId === user._id);
      } else if (user.role === "viewer") {
        sales = sales.filter((s) => s.userId === user._id);
      }
    } else {
      sales = await salesQuery.order("desc").take(args.limit ?? 100);
    }

    return await Promise.all(
      sales.map(async (sale) => {
        const car = await ctx.db.get(sale.carId);
        const customer = await ctx.db.get(sale.customerId);
        const seller = await ctx.db.get(sale.sellerId);

        // حساب الضريبة والرسوم في حال كانت مفقودة للبيانات القديمة
        return {
          ...sale,
          carName: car ? `${car.make} ${car.model}` : "سيارة محذوفة",
          customerName: customer?.fullName || "⚠️ زبون غير معرف (تم حذفه)",
          vin: sale.vin || car?.vin || "---",
          mileageAtSale: sale.mileageAtSale || car?.mileage || 0,
          subtotal: sale.subtotal || (sale.amountPaid * 0.81), // افتراضي 19%
          taxAmount: sale.taxAmount || (sale.amountPaid * 0.19),
          profit: sale.amountPaid - (car?.purchasePrice || 0),
          phone: customer?.phone,
          address: customer?.address,
          email: customer?.email,
          sellerName: seller?.fullName || "موظف سابق",
        };
      })
    );
  },
});