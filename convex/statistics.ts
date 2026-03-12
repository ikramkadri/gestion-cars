import { query } from "./_generated/server";

/**
 * حساب الأرباح والمخزون والتحليلات البيانية
 * تم تحسين الاستعلام باستخدام الـ Indexes (O(log n))
 * تم توحيد مصدر البيانات (Consistency) بالاعتماد على جدول السيارات كمرجع للحالة
 */
export const getDashboardStats = query({
  args: {}, 
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("يجب تسجيل الدخول");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("المستخدم غير مسجل");

    // جلب السيارات المتاحة غير المؤرشفة (المصدر الأول للحقيقة)
    const availableCars = await ctx.db
      .query("cars")
      .withIndex("by_status", (q) => q.eq("status", "Available").eq("isArchived", false))
      .collect();

    // جلب السيارات المباعة غير المؤرشفة (المصدر الثاني للحقيقة لضمان الاتساق)
    const soldCars = await ctx.db
      .query("cars")
      .withIndex("by_status", (q) => q.eq("status", "Sold").eq("isArchived", false))
      .collect();

    const allActiveCars = [...availableCars, ...soldCars];
    
    // جلب المبيعات للعمليات المالية فقط
    const allSales = await ctx.db.query("sales").collect();

    // حماية البيانات: الأدوار غير الإدارية ترى فقط إحصائيات المخزون العامة
    if (user.role !== "admin") {
      return { 
        inventory: { 
          available: availableCars.length, 
          total: allActiveCars.length 
        } 
      }; 
    }

    // حسابات مالية دقيقة للإدارة
    const carsMap = new Map(allActiveCars.map((c) => [c._id, c]));
    let totalRevenue = 0;
    let totalProfit = 0;

    allSales.forEach((sale) => {
      totalRevenue += sale.amountPaid;
      const car = carsMap.get(sale.carId);
      if (car) {
        // الربح الحقيقي = مبلغ البيع - سعر الشراء الأصلي المخزن
        totalProfit += (sale.amountPaid - car.purchasePrice);
      }
    });

    // قيمة المخزون الحالي بناءً على تكلفة الشراء للسيارات المتاحة فقط
    const stockValue = availableCars.reduce((sum, car) => sum + car.purchasePrice, 0);

    return {
      inventory: {
        available: availableCars.length,
        sold: soldCars.length, 
        total: allActiveCars.length,
      },
      financials: {
        totalRevenue,
        totalProfit,
        stockValue,
      },
      updatedAt: new Date().toISOString()
    };
  },
});