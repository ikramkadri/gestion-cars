import { query } from "./_generated/server";
import { v } from "convex/values";

export const getInvoiceData = query({
  args: { saleId: v.id("sales") },
  handler: async (ctx, args) => {
    const sale = await ctx.db.get(args.saleId);
    if (!sale) throw new Error("السجل غير موجود");
    const [car, customer, seller] = await Promise.all([ctx.db.get(sale.carId), ctx.db.get(sale.customerId), ctx.db.get(sale.sellerId)]);
    return {
      invoiceNumber: sale.invoiceNumber, date: sale.saleDate, amount: sale.amountPaid, paymentMethod: sale.paymentMethod,
      car: { name: `${car?.make} ${car?.model}`, year: car?.year, mileage: car?.mileage },
      customer: { name: customer?.fullName, phone: customer?.phone },
      seller: { name: seller?.fullName }
    };
  },
});