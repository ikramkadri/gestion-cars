/**
 * المسار: convex/statistics.ts
 * الوظيفة: تزويد لوحة التحكم بالأرقام المالية، حالة المخزون، وبيانات الرسم البياني للمبيعات الشهرية.
 */

import { query } from "./_generated/server";

export const getDashboardStats = query({
  handler: async (ctx) => {
    // 1. جلب السيارات المتاحة والمباعة باستخدام الفهارس (للأداء العالي)
    const availableCars = await ctx.db
      .query("cars")
      .withIndex("by_status_archived", (q) => 
        q.eq("status", "Available").eq("isArchived", false)
      )
      .collect();

    const soldCars = await ctx.db
      .query("cars")
      .withIndex("by_status_archived", (q) => 
        q.eq("status", "Sold").eq("isArchived", false)
      )
      .collect();

    // 2. جلب جميع عمليات البيع
    const allSales = await ctx.db.query("sales").collect();

    // 3. الحسابات المالية الأساسية
    const totalRevenue = allSales.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
    
    // جلب بيانات السيارات المرتبطة بالمبيعات لحساب الأرباح
    const soldCarIds = allSales.map(s => s.carId);
    const soldCarsData = await Promise.all(
      soldCarIds.map(id => ctx.db.get(id))
    );
    
    let totalProfit = 0;
    allSales.forEach((sale, index) => {
      const car = soldCarsData[index];
      if (car && typeof car.purchasePrice === "number") {
        totalProfit += (sale.amountPaid - car.purchasePrice);
      }
    });

    const stockValue = availableCars.reduce((sum, c) => sum + (c.purchasePrice || 0), 0);

    // 4. إعداد بيانات الرسم البياني (المبيعات الشهرية)
    // سنقوم بإنشاء خريطة (Map) لتجميع المبيعات حسب "السنة-الشهر"
    const monthlyDataMap = new Map<string, { month: string; revenue: number; count: number }>();

    // أسماء الأشهر بالعربية للعرض
    const monthNames = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];

    allSales.forEach((sale) => {
      const date = new Date(sale.saleDate || sale._creationTime);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${monthIndex}`; // مفتاح فريد للشهر والسنة

      const existing = monthlyDataMap.get(key) || { 
        month: `${monthNames[monthIndex]} ${year}`, 
        revenue: 0, 
        count: 0 
      };

      existing.revenue += (sale.amountPaid || 0);
      existing.count += 1;
      monthlyDataMap.set(key, existing);
    });

    // تحويل الخريطة إلى مصفوفة مرتبة زمنياً لعرضها في الرسم البياني
    const chartData = Array.from(monthlyDataMap.values()).slice(-6); // آخر 6 أشهر فقط

    return {
      inventory: { 
        available: availableCars.length, 
        sold: soldCars.length, 
        total: availableCars.length + soldCars.length 
      },
      financials: { 
        totalRevenue, 
        totalProfit, 
        stockValue 
      },
      chartData, // هذه البيانات تذهب مباشرة للرسم البياني
      lastUpdate: Date.now()
    };
  },
});