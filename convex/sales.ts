import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * إنشاء عملية بيع احترافية مع حماية أمنية كاملة
 */
export const createSale = mutation({
  args: {
    carId: v.id("cars"),
    customerName: v.string(),
    phone: v.string(),
    amountPaid: v.number(),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("يجب تسجيل الدخول لإتمام العملية");

    const user = await ctx.db.query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user) throw new Error("المستخدم غير موجود");

    const now = new Date();
    const timestamp = now.toISOString();

    const car = await ctx.db.get(args.carId);
    if (!car || car.status !== "Available" || car.isArchived) {
      throw new Error("عذراً، السيارة لم تعد متاحة للبيع");
    }

    // إغلاق الثغرة الأمنية: التأكد من مطابقة السعر
    if (args.amountPaid < car.price) {
        throw new Error(`خطأ: المبلغ المدفوع أقل من سعر السيارة الرسمي (${car.price})`);
    }

    // منع الـ Race Condition
    const existingSale = await ctx.db
      .query("sales")
      .withIndex("by_carId", (q) => q.eq("carId", args.carId))
      .first();

    if (existingSale) {
      throw new Error("هذه السيارة مسجلة كمبيوعة بالفعل");
    }

    // توليد رقم فاتورة تسلسلي
    const lastSale = await ctx.db.query("sales").withIndex("by_invoice").order("desc").first();
    let nextNum = 1;
    if (lastSale?.invoiceNumber) {
      const parts = lastSale.invoiceNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastSeq)) nextNum = lastSeq + 1;
    }
    const invoiceNumber = `INV-${now.getFullYear()}-${nextNum.toString().padStart(4, '0')}`;

    // معالجة بيانات الزبون
    const customer = await ctx.db.query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone)).first();
      
    const customerId = customer ? customer._id : await ctx.db.insert("customers", {
      fullName: args.customerName,
      phone: args.phone,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // تحديث الحالة وإدراج البيع (Atomic Transaction)
    await ctx.db.patch(args.carId, { status: "Sold", updatedAt: timestamp });

    const saleId = await ctx.db.insert("sales", {
      invoiceNumber,
      carId: args.carId,
      customerId,
      sellerId: user._id,
      saleDate: timestamp,
      amountPaid: args.amountPaid,
      paymentMethod: args.paymentMethod,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // سجل النشاطات
    await ctx.db.insert("activityLogs", {
      userId: user._id,
      action: "SALE_COMPLETE",
      entity: "sales",
      entityId: saleId,
      details: `بيع سيارة ${car.make} برقم فاتورة ${invoiceNumber}`,
      timestamp: timestamp,
    });

    return { saleId, invoiceNumber };
  },
});

/**
 * جلب سجلات المبيعات الأخيرة
 */
export const getRecentSales = query({
  args: {},
  handler: async (ctx) => {
    const sales = await ctx.db.query("sales").order("desc").take(10);
    return Promise.all(sales.map(async (sale) => {
      const car = await ctx.db.get(sale.carId);
      const customer = await ctx.db.get(sale.customerId);
      return {
        ...sale,
        carName: car ? `${car.make} ${car.model}` : "سيارة محذوفة",
        customerName: customer?.fullName,
      };
    }));
  },
});