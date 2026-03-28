import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * جلب بيانات الفاتورة الرسمية للطباعة أو العرض
 * تم تحديث الدالة لضمان مطابقة البيانات مع الـ Schema النهائي
 */
export const getInvoiceData = query({
  args: { saleId: v.id("sales") },
  handler: async (ctx, args) => {
    // 1. التحقق من الهوية
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("غير مصرح لك بالوصول: يرجى تسجيل الدخول");

    // 2. جلب سجل البيع
    const sale = await ctx.db.get(args.saleId);
    if (!sale) throw new Error("سجل البيع غير موجود في قاعدة البيانات");

    // 3. جلب البيانات المرتبطة (السيارة، الزبون، البائع) بالتوازي لتحسين الأداء
    const [car, customer, seller] = await Promise.all([
      ctx.db.get(sale.carId),
      ctx.db.get(sale.customerId),
      ctx.db.get(sale.sellerId),
    ]);

    // 4. بناء كائن البيانات النهائي مع معالجة القيم الفارغة (Optional Chaining)
    return {
      invoiceNumber: sale.invoiceNumber,
      date: sale.saleDate,
      amount: sale.amountPaid,
      paymentMethod: sale.paymentMethod,
      car: {
        id: car?._id,
        name: `${car?.make ?? "غير معروف"} ${car?.model ?? ""}`,
        year: car?.year,
        mileage: car?.mileage,
        condition: car?.condition,
      },
      customer: {
        name: customer?.fullName ?? "زبون عام",
        phone: customer?.phone ?? "بدون هاتف",
        email: customer?.email,
      },
      seller: {
        name: seller?.fullName ?? "موظف النظام",
        email: seller?.email,
      },
      metadata: {
        printedAt: Date.now(),
        status: "Official Document"
      }
    };
  },
});