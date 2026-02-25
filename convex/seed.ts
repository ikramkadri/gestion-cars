import { mutation } from "./_generated/server";

export const seedData = mutation({
  handler: async (ctx) => {
    // 1. مسح البيانات القديمة (اختياري، لتبدأ من الصفر)
    const existingCars = await ctx.db.query("cars").collect();
    for (const car of existingCars) await ctx.db.delete(car._id);
    
    const existingSales = await ctx.db.query("sales").collect();
    for (const sale of existingSales) await ctx.db.delete(sale._id);

    // 2. إضافة سيارات نموذجية
    const car1Id = await ctx.db.insert("cars", {
      make: "Toyota", model: "Camry", year: 2022,
      purchasePrice: 15000, price: 18000, mileage: 12000,
      condition: "Excellent", status: "Sold",
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });

    const car2Id = await ctx.db.insert("cars", {
      make: "Hyundai", model: "Tucson", year: 2021,
      purchasePrice: 12000, price: 14500, mileage: 35000,
      condition: "Good", status: "Available",
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });

    const car3Id = await ctx.db.insert("cars", {
      make: "Volkswagen", model: "Golf 8", year: 2023,
      purchasePrice: 20000, price: 23000, mileage: 5000,
      condition: "Excellent", status: "Available",
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });

    // 3. إضافة زبون
    const customerId = await ctx.db.insert("customers", {
      fullName: "رشيد الجزائري",
      phone: "0550123456",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 4. تسجيل عملية بيع للسيارة الأولى (التي وضعنا حالتها Sold)
    await ctx.db.insert("sales", {
      carId: car1Id,
      customerId: customerId,
      saleDate: new Date().toISOString(),
      amountPaid: 17500, // بعناها بخصم بسيط (السعر المعروض كان 18000)
      paymentMethod: "Cash",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return "تم ملء قاعدة البيانات بنجاح! اذهب للـ Dashboard الآن.";
  },
});