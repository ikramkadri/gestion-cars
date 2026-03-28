import { query } from "./_generated/server";

/**
 * دالة الإحصائيات المتقدمة - نسخة التقارير الشهرية وتحليل الأداء
 */
export const getDashboardStats = query({
  args: {}, 
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    // جلب البيانات الأساسية
    const [availableCars, soldCars, allSales] = await Promise.all([
      ctx.db.query("cars").withIndex("by_status", (q) => q.eq("status", "Available").eq("isArchived", false)).collect(),
      ctx.db.query("cars").withIndex("by_status", (q) => q.eq("status", "Sold").eq("isArchived", false)).collect(),
      ctx.db.query("sales").collect()
    ]);

    if (user.role === "viewer") {
      return { inventory: { available: availableCars.length, sold: soldCars.length } }; 
    }

    const carsMap = new Map([...availableCars, ...soldCars].map((c) => [c._id, c]));
    
    let totalRevenue = 0;
    let totalProfit = 0;
    const paymentMethods: Record<string, number> = {};
    
    // إحصائيات شهرية (Monthly Reports)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let salesThisMonth = 0;
    let revenueThisMonth = 0;

    allSales.forEach((sale) => {
      const saleDate = new Date(sale.saleDate);
      
      // حساب إجمالي الإيرادات وطرق الدفع
      totalRevenue += sale.amountPaid;
      paymentMethods[sale.paymentMethod] = (paymentMethods[sale.paymentMethod] || 0) + 1;
      
      // حساب الأرباح الصافية
      const car = carsMap.get(sale.carId);
      if (car) {
        totalProfit += (sale.amountPaid - car.purchasePrice);
      }

      // فلترة مبيعات الشهر الحالي للتقارير
      if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
        salesThisMonth++;
        revenueThisMonth += sale.amountPaid;
      }
    });

    return {
      inventory: {
        available: availableCars.length,
        sold: soldCars.length,
        total: availableCars.length + soldCars.length,
      },
      financials: {
        totalRevenue,
        totalProfit,
        stockValue: availableCars.reduce((sum, c) => sum + c.purchasePrice, 0),
        paymentStats: paymentMethods
      },
      monthlyReport: {
        month: currentMonth + 1,
        year: currentYear,
        salesCount: salesThisMonth,
        revenue: revenueThisMonth
      },
      updatedAt: Date.now()
    };
  },
});