/**
 * المسار: convex/statistics.ts
 * الوظيفة: تزويد لوحة التحكم بالأرقام المالية، حالة المخزون، وبيانات الرسم البياني للمبيعات الشهرية.
 */
import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth";

export const getDashboardStats = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    const isAdmin = user?.role === "admin";
    const isSales = user?.role === "sales_manager";

    // 1. جلب السيارات المتاحة والمباعة باستخدام الفهارس (للأداء العالي)
    const availableCars = await ctx.db
      .query("cars")
      .withIndex("by_status_archived", (q) => 
        q.eq("status", "Available").eq("isArchived", false) // Type is inferred
      )
      .collect();

    const soldCars = await ctx.db
      .query("cars")
      .withIndex("by_status_archived", (q) => 
        q.eq("status", "Sold").eq("isArchived", false) // Type is inferred
      )
      .collect();

    // جلب الحجوزات النشطة لحساب السيارات المحجوزة
    const pendingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // 2. جلب جميع عمليات البيع
    // إذا كان مدير مبيعات، نجلب مبيعاته فقط
    let salesQuery = ctx.db.query("sales");
    if (isSales) {
      salesQuery = salesQuery.filter((q) => q.eq(q.field("sellerId"), user?._id)); // Type is inferred
    }
    const allSales = await salesQuery.collect();

    // 3. الحسابات المالية الأساسية
    const totalRevenue = allSales.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
    
    let totalProfit = 0;
    let sumDaysToSell = 0;
    const brandMap = new Map<string, number>();
    const sellersMap = new Map<string, { name: string, total: number, count: number }>();
    const sourceMap = new Map<string, number>();

    // الأدمن ومدير المبيعات يريان الإحصائيات (كل واحد حسب صلاحياته في جلب allSales)
    if (isAdmin || isSales) {
      for (const sale of allSales) {
        const car = await ctx.db.get(sale.carId);
        const seller = await ctx.db.get(sale.sellerId);
        
        if (car) {
          // 1. حساب الربح (للأدمن فقط لضمان السرية المالية)
          if (isAdmin) {
            totalProfit += (sale.amountPaid - (car.purchasePrice || 0));
          }

          // 2. حساب أيام البيع (تاريخ البيع - تاريخ الإضافة للمخزن)
          const days = Math.floor((sale.saleDate - car.createdAt) / (1000 * 60 * 60 * 24));
          sumDaysToSell += Math.max(0, days);

          // 3. توزيع العلامات التجارية
          brandMap.set(car.make, (brandMap.get(car.make) || 0) + 1);

          // 4. توزيع مصادر المبيعات (عن طريق الحجوزات المرتبطة)
          if (sale.bookingId) {
            const booking = await ctx.db.get(sale.bookingId);
            if (booking?.bookingSource) {
              sourceMap.set(booking.bookingSource, (sourceMap.get(booking.bookingSource) || 0) + 1);
            }
          }
        }

        if (seller) {
          const sData = sellersMap.get(seller._id) || { name: seller.fullName, total: 0, count: 0 };
          sData.total += sale.amountPaid;
          sData.count += 1;
          sellersMap.set(seller._id, sData);
        }
      }
    }

    const stockValue = availableCars.reduce((sum, c) => sum + (c.purchasePrice || 0), 0);
    const averageDaysToSell = allSales.length > 0 ? Math.round(sumDaysToSell / allSales.length) : 0;

    // حساب معدل التحويل (المبيعات مقسومة على إجمالي الحجوزات + المبيعات)
    const totalRequests = pendingBookings.length + allSales.length;
    const conversionRate = totalRequests > 0 ? Math.round((allSales.length / totalRequests) * 100) : 0;

    // تحويل خرائط البيانات إلى مصفوفات للواجهة
    const brandDistribution = Array.from(brandMap.entries()).map(([name, value]) => ({ name, value }));
    const leaderboard = Array.from(sellersMap.values()).sort((a, b) => b.total - a.total);
    
    const sourceDistribution = Array.from(sourceMap.entries()).map(([name, value]) => ({ 
      name: name === "website" ? "الموقع" : 
            name === "whatsapp" ? "واتساب" : 
            name === "facebook" ? "فيسبوك" : 
            name === "phone_call" ? "اتصال هاتفي" : name, 
      value 
    }));

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
      const monthIndex = date.getMonth(); // Type is inferred
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
        total: availableCars.length + soldCars.length,
        reserved: pendingBookings.length,
        averageDaysToSell
      },
      financials: { 
        totalRevenue, 
        totalProfit, 
        expenses: 0,
        stockValue,
        conversionRate
      },
      chartData, // هذه البيانات تذهب مباشرة للرسم البياني
      brandDistribution,
      sourceDistribution,
      leaderboard,
      lastUpdate: Date.now()
    };
  },
});