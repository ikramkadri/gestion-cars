/**
 * المسار: convex/sales.ts
 * الوظيفة: إتمام صفقات البيع، توليد أرقام الفواتير، والتحقق من القواعد المالية.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createSale = mutation({
  args: { 
    carId: v.id("cars"), 
    customerName: v.string(), 
    phone: v.string(), 
    amountPaid: v.number(), 
    paymentMethod: v.union(v.literal("Cash"), v.literal("Bank Transfer"), v.literal("Card"), v.literal("Check")) 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("غير مصرح");

    const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user || user.role === "viewer") throw new Error("لا تملك صلاحية البيع");

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
      sellerId: user._id, 
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

export const getAllSales = query({
  args: { invoiceSearch: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const sales = await ctx.db.query("sales").order("desc").collect();
    if (args.invoiceSearch) {
      const search = args.invoiceSearch.toLowerCase();
      return sales.filter(s => s.invoiceNumber.toLowerCase().includes(search));
    }
    return sales;
  },
});