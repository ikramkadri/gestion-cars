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
    if (!identity) throw new Error("غير مصرح: يجب تسجيل الدخول");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role === "viewer") {
      throw new Error("لا تملك صلاحية إتمام عمليات البيع");
    }

    const car = await ctx.db.get(args.carId);
    if (!car || car.status !== "Available" || car.isArchived) {
      throw new Error("عذراً، السيارة لم تعد متاحة أو تم بيعها بالفعل");
    }

    if (args.amountPaid < car.price * 0.8) { 
      throw new Error("المبلغ المدفوع أقل من الحد الأدنى المسموح به (80% من السعر)");
    }

    if (args.phone.length < 8) throw new Error("رقم الهاتف غير صحيح");

    const now = Date.now();
    const dateObj = new Date(now);
    const dateString = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
    const invoiceNumber = `INV-${dateString}-${Math.floor(Math.random() * 1000)}`;

    const existingCustomer = await ctx.db
      .query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .unique();

    let customerId;
    if (!existingCustomer) {
      customerId = await ctx.db.insert("customers", { 
        fullName: args.customerName, 
        phone: args.phone, 
        createdAt: now, 
        updatedAt: now 
      });
    } else {
      customerId = existingCustomer._id;
    }

    await ctx.db.patch(args.carId, { status: "Sold", updatedAt: now });

    const saleId = await ctx.db.insert("sales", {
      invoiceNumber,
      carId: args.carId,
      customerId,
      sellerId: user._id,
      saleDate: now,
      amountPaid: args.amountPaid,
      paymentMethod: args.paymentMethod,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("notifications", {
      title: "عملية بيع ناجحة ✅",
      message: `تم بيع ${car.make} ${car.model} للزبون ${args.customerName} بمبلغ ${args.amountPaid.toLocaleString()} دج`,
      type: "success",
      isRead: false,
      createdAt: now,
    });

    await ctx.db.insert("activity_logs", {
      action: "SALE_CREATED",
      details: `تم إنشاء فاتورة رقم ${invoiceNumber} للسيارة ${car.make}. البائع: ${user.fullName}`,
      userId: user._id,
      timestamp: now
    });

    return saleId;
  },
});

/**
 * جلب جميع المبيعات
 */
export const getAllSales = query({
  args: { invoiceSearch: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    const sales = await ctx.db.query("sales").order("desc").collect();

    if (args.invoiceSearch) {
      const searchLower = args.invoiceSearch.toLowerCase();
      return sales.filter(s => s.invoiceNumber.toLowerCase().includes(searchLower));
    }
    return sales;
  },
});
