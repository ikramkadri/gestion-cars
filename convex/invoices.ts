import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * جلب بيانات الفاتورة الرسمية بناءً على رقم الفاتورة أو معرف العملية
 */
export const getInvoiceData = query({
  args: { saleId: v.id("sales") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("غير مصرح لك");

    const sale = await ctx.db.get(args.saleId);
    if (!sale) throw new Error("سجل البيع غير موجود");

    // جلب البيانات المرتبطة بالتوازي لتحقيق أقصى سرعة
    const [car, customer, seller] = await Promise.all([
      ctx.db.get(sale.carId),
      ctx.db.get(sale.customerId),
      ctx.db.get(sale.sellerId),
    ]);

    return {
      invoiceNumber: sale.invoiceNumber, // استخدام الرقم التسلسلي الاحترافي
      date: sale.saleDate,
      amount: sale.amountPaid,
      paymentMethod: sale.paymentMethod,
      car: {
        name: `${car?.make} ${car?.model}`,
        year: car?.year,
        id: car?._id,
      },
      customer: {
        name: customer?.fullName,
        phone: customer?.phone,
      },
      seller: {
        name: seller?.fullName,
      }
    };
  },
});