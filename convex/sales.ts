import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * إنشاء عملية بيع احترافية مع حماية هندسية كاملة
 * تم تحسين توليد رقم الفاتورة لتقليل احتمالية التكرار وضمان الأداء
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

    // 1. التثبت من حالة السيارة (خط الدفاع الأول)
    const car = await ctx.db.get(args.carId);
    if (!car || car.status !== "Available" || car.isArchived) {
      throw new Error("عذراً، السيارة لم تعد متاحة للبيع");
    }

    // 2. منع الـ Race Condition (خط الدفاع الثاني - فحص جدول المبيعات)
    const existingSale = await ctx.db
      .query("sales")
      .withIndex("by_carId", (q) => q.eq("carId", args.carId))
      .first();

    if (existingSale) {
      throw new Error("هذه السيارة مسجلة كمبيوعة بالفعل في النظام");
    }

    // 3. توليد رقم فاتورة تسلسلي (تحسين الأداء Scalability)
    // نجلب آخر فاتورة فقط باستخدام الفهرس بدلاً من جلب المصفوفة كاملة
    const lastSale = await ctx.db
      .query("sales")
      .withIndex("by_invoice")
      .order("desc")
      .first();
    
    let nextNum = 1;
    if (lastSale && lastSale.invoiceNumber) {
      const parts = lastSale.invoiceNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastSeq)) nextNum = lastSeq + 1;
    }
    
    const invoiceNumber = `INV-${now.getFullYear()}-${nextNum.toString().padStart(4, '0')}`;

    // 4. معالجة بيانات الزبون (التأكد من عدم التكرار بالهاتف)
    let customer = await ctx.db.query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone)).first();
      
    const customerId = customer ? customer._id : await ctx.db.insert("customers", {
      fullName: args.customerName,
      phone: args.phone,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // 5. تحديث الحالة وإدراج البيع (تتم كعملية واحدة Atomic Transaction)
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

    // 6. تسجيل النشاط للرقابة
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
 * جلب سجلات المبيعات الأخيرة للواجهة الأمامية
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
        carName: `${car?.make} ${car?.model}`,
        customerName: customer?.fullName,
      };
    }));
  },
});