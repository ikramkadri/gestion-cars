/**
 * المسار: convex/sales.ts
 * الوظيفة: إتمام صفقات البيع، توليد أرقام الفواتير، والتحقق من القواعد المالية.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth"; // استيراد دالة المصادقة الموحدة

export const createSale = mutation({
  args: { 
    carId: v.id("cars"), 
    customerName: v.string(), 
    phone: v.string(), 
    amountPaid: v.number(), 
    paymentMethod: v.union(v.literal("Cash"), v.literal("Bank Transfer"), v.literal("Card"), v.literal("Check")),
    token: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("غير مصرح لك.");

    // صلاحيات الأدمن أو مدير المبيعات فقط
    if (user.role !== "admin" && user.role !== "sales_manager") throw new Error("لا تملك صلاحية البيع.");

    const car = await ctx.db.get(args.carId);
    if (!car || car.status !== "Available" || car.isArchived) throw new Error("السيارة غير متاحة للبيع");

    if (args.amountPaid < car.price * 0.8) throw new Error("المبلغ أقل من الحد الأدنى المسموح به");

    const now = Date.now();
    const dateObj = new Date(now);
    const dateString = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
    const invoiceNumber = `INV-${dateString}-${Math.floor(Math.random() * 1000)}`;

    const customer = await ctx.db.query("customers").withIndex("by_phone", (q) => q.eq("phone", args.phone)).unique();
    
    // إصلاح خطأ undefined عبر التأكد من وجود القيمة دائماً
    let customerId;
    if (!customer) {
      customerId = await ctx.db.insert("customers", { fullName: args.customerName, phone: args.phone, createdAt: now, updatedAt: now });
    } else {
      customerId = customer._id;
    }

    await ctx.db.patch(args.carId, { status: "Sold", updatedAt: now });
    
    const saleId = await ctx.db.insert("sales", {
      invoiceNumber,
      carId: args.carId,
      customerId: customerId, // الآن TypeScript متأكد أن المعرف متاح
      sellerId: user._id, // البائع هو المستخدم المصادق عليه
      saleDate: now, 
      amountPaid: args.amountPaid, 
      paymentMethod: args.paymentMethod, 
      createdAt: now, 
      updatedAt: now,
    });

    await ctx.db.insert("notifications", { title: "بيع ناجح ✅", message: `تم بيع ${car.make} لـ ${args.customerName}`, type: "success", isRead: false, createdAt: now });
    await ctx.db.insert("activity_logs", { action: "SALE_CREATED", details: `فاتورة ${invoiceNumber}`, userId: user._id, timestamp: now });

    return saleId;
  },
});

/**
 * جلب المبيعات الأخيرة مع تفاصيل السيارة والزبون للعرض في لوحة التحكم
 * (هذه الدالة لا تتطلب توكن حالياً، يمكن جعلها محمية إذا لزم الأمر)
 */
export const getRecentSales = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const sales = await ctx.db.query("sales").order("desc").take(args.limit ?? 5);

    return await Promise.all(
      sales.map(async (sale) => {
        const car = await ctx.db.get(sale.carId);
        const customer = await ctx.db.get(sale.customerId);
        return {
          ...sale,
          carName: car ? `${car.make} ${car.model}` : "سيارة محذوفة",
          customerName: customer?.fullName || "زبون غير معروف",
        };
      })
    );
  },
});