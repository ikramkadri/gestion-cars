import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth";
import { Doc, Id } from "./_generated/dataModel"; // تأكد من استيراد Doc

/**
 * دالة مساعدة لتوليد نص البحث المدمج
 * تدعم الآن البحث بالولايات (الرقم، الاسم العربي، والاسم اللاتيني للولايات الـ 10 الأولى)
 */
function generateSearchName(make: string, model: string, year: number, location: string) {
  const wilayaCode = location.split(' - ')[0];
  const latinNames: Record<string, string> = {
    '01': 'Adrar أدرار',
    '02': 'Chlef الشلف',
    '03': 'Laghouat الأغواط',
    '04': 'Oum El Bouaghi أم البواقي',
    '05': 'Batna باتنة',
    '06': 'Bejaia بجاية',
    '07': 'Biskra بسكرة',
    '08': 'Bechar بشار',
    '09': 'Blida البليدة',
    '10': 'Bouira البويرة',
    '16': 'Algiers Alger الجزائر',
    '31': 'Oran وهران'
  };
  const wilayaInfo = latinNames[wilayaCode] || location;
  return `${make} ${model} ${year} ${wilayaInfo}`.toLowerCase();
}

/** // CarInsertData is already defined
 * تعريف نوع بيانات السيارة لضمان مطابقة الـ Schema تماماً وتجنب أخطاء TypeScript
 */
interface CarInsertData {
  make: string;
  model: string;
  searchName: string;
  origin?: string;
  year: number;
  description?: string;
  images?: Id<"_storage">[];
  mainImage?: Id<"_storage">;
  purchasePrice: number;
  price: number;
  mileage: number;
  vin?: string;
  sellerId: Id<"users">;
  slug: string;
  location: string;
  hasWarranty: boolean;
  cylinders?: number;
  fuel: "Gasoline" | "Diesel" | "Electric" | "Hybrid";
  transmission: "Automatic" | "Manual";
  drivetrain: "FWD" | "RWD" | "AWD" | "4WD";
  engineSize?: string;
  color?: string; 
  condition: "New" | "Excellent" | "Good" | "Fair" | "Poor"; 
  viewCount: number;
  status: "Available" | "Sold" | "Reserved"; 
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * إضافة سيارة جديدة - معايير عالمية: (تدقيق الصلاحيات + أتمتة الإشعارات)
 */
export const addCar = mutation({
  args: {
    token: v.string(),
    make: v.string(),
    model: v.string(),
    origin: v.optional(v.string()),
    year: v.number(),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
    mainImage: v.optional(v.id("_storage")),
    purchasePrice: v.number(),
    price: v.number(),
    mileage: v.number(),
    vin: v.optional(v.string()),
    location: v.string(),
    hasWarranty: v.boolean(),
    cylinders: v.optional(v.number()),
    fuel: v.union(v.literal("Gasoline"), v.literal("Diesel"), v.literal("Electric"), v.literal("Hybrid")),
    transmission: v.union(v.literal("Automatic"), v.literal("Manual")),
    drivetrain: v.union(v.literal("FWD"), v.literal("RWD"), v.literal("AWD"), v.literal("4WD")),
    engineSize: v.optional(v.string()),
    color: v.optional(v.string()),
    condition: v.union(v.literal("New"), v.literal("Excellent"), v.literal("Good"), v.literal("Fair"), v.literal("Poor")),
  },
  handler: async (ctx, {
    token,
    make,
    model,
    origin,
    year,
    description,
    images,
    mainImage,
    purchasePrice,
    price,
    mileage,
    vin,
    location,
    hasWarranty,
    cylinders,
    fuel,
    transmission,
    drivetrain,
    engineSize,
    color,
    condition
  }) => {
    const user = await getAuthenticatedUser(ctx, token);
    if (!user || user.role === "viewer") {
      throw new Error("عذراً، لا تملك صلاحية إضافة سيارات.");
    }

    const now = Date.now();
    const slug = `${make}-${model}-${now}`.toLowerCase().replace(/ /g, "-");
    const searchName = generateSearchName(make, model, year, location);

    const carData: CarInsertData = {
      make: make,
      model: model,
      searchName: searchName,
      origin: origin,
      year: year,
      description: description,
      images: images,
      mainImage: mainImage,
      purchasePrice: purchasePrice,
      price: price,
      mileage: mileage,
      vin: vin,
      location: location,
      sellerId: user._id,
      slug: slug,
      hasWarranty: hasWarranty,
      cylinders: cylinders,
      fuel: fuel,
      transmission: transmission,
      drivetrain: drivetrain,
      engineSize: engineSize,
      color: color,
      condition: condition,
      viewCount: 0,
      status: "Available",
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    const carId = await ctx.db.insert("cars", carData);

    await ctx.db.insert("notifications", {
      title: "سيارة جديدة بالمخزن 🚘",
      message: `تمت إضافة ${make} ${model} بواسطة ${user.fullName}`,
      type: "success",
      priority: "medium",
      isRead: false,
      createdAt: now,
    });

    return carId;
  },
});

/**
 * تحديث بيانات سيارة (ميزة ضرورية للمواقع الاحترافية)
 */
export const updateCar = mutation({
  args: {
    token: v.string(),
    carId: v.id("cars"),
    updates: v.object({ // تحديد الحقول القابلة للتحديث بشكل صريح
      make: v.optional(v.string()),
      model: v.optional(v.string()),
      origin: v.optional(v.string()),
      year: v.optional(v.number()),
      description: v.optional(v.string()),
      images: v.optional(v.array(v.id("_storage"))),
      mainImage: v.optional(v.id("_storage")),
      purchasePrice: v.optional(v.number()),
      price: v.optional(v.number()),
      vin: v.optional(v.string()),
      mileage: v.optional(v.number()),
      location: v.optional(v.string()),
      hasWarranty: v.optional(v.boolean()),
      cylinders: v.optional(v.number()),
      fuel: v.optional(v.union(v.literal("Gasoline"), v.literal("Diesel"), v.literal("Electric"), v.literal("Hybrid"))),
      transmission: v.optional(v.union(v.literal("Automatic"), v.literal("Manual"))),
      drivetrain: v.optional(v.union(v.literal("FWD"), v.literal("RWD"), v.literal("AWD"), v.literal("4WD"))),
      engineSize: v.optional(v.string()),
      color: v.optional(v.string()),
      condition: v.optional(v.union(v.literal("New"), v.literal("Excellent"), v.literal("Good"), v.literal("Fair"), v.literal("Poor"))),
      status: v.optional(v.union(v.literal("Available"), v.literal("Sold"), v.literal("Reserved"))),
      isArchived: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { token, carId, updates }) => {
    const user = await getAuthenticatedUser(ctx, token);
    if (!user || (user.role !== "admin" && user.role !== "sales_manager")) throw new Error("غير مصرح لك بتعديل السيارات");

    const existingCar = await ctx.db.get(carId);
    if (!existingCar) throw new Error("السيارة غير موجودة.");

    // تحديث نص البحث إذا تغيرت أي من الحقول الأساسية أو الموقع
    let searchName = existingCar.searchName;
    if (updates.make !== undefined || updates.model !== undefined || 
        updates.year !== undefined || updates.location !== undefined) {
      searchName = generateSearchName(
        updates.make ?? existingCar.make,
        updates.model ?? existingCar.model,
        updates.year ?? existingCar.year,
        updates.location ?? existingCar.location
      );
    }

    await ctx.db.patch(carId, {
      ...updates,
      searchName,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      title: "تحديث بيانات سيارة 📝",
      message: `تم تحديث بيانات ${existingCar.make} ${existingCar.model} بواسطة ${user.fullName}`,
      type: "info",
      priority: "low",
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * حذف سيارة نهائياً مع حذف صورها من التخزين (إدارة موارد عالمية)
 */
export const deleteCar = mutation({
  args: { token: v.string(), carId: v.id("cars") },
  handler: async (ctx, { token, carId }) => {
    const user = await getAuthenticatedUser(ctx, token);
    if (!user || user.role !== "admin") throw new Error("للأدمن فقط");

    const car = await ctx.db.get(carId);
    if (car) {
      // منع الحذف النهائي لضمان بقاء السجلات: نقوم بالأرشفة فقط
      await ctx.db.patch(carId, { isArchived: true, updatedAt: Date.now() });
    }
  },
});

/**
 * حذف سيارة محددة بواسطة الـ ID (لحل مشاكل تعارض الـ Schema)
 */
export const deleteCarById = mutation({
  args: { carId: v.id("cars") },
  handler: async (ctx, { carId }) => {
    await ctx.db.patch(carId, { isArchived: true, updatedAt: Date.now() });
    return "تم نقل السيارة إلى الأرشيف بنجاح.";
  },
});

/**
 * تنظيف جدول السيارات بالكامل
 */
export const clearAllCars = mutation({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    const user = await getAuthenticatedUser(ctx, token);
    if (!user || user.role !== "admin") throw new Error("صلاحية الأدمن مطلوبة.");

    const cars = await ctx.db.query("cars").collect();
    for (const car of cars) {
      await ctx.db.delete(car._id);
    }
    return `تم حذف ${cars.length} سيارة بنجاح.`;
  },
});

/**
 * جلب السيارات مع تصفية متقدمة (Pagination & Filtering)
 */
export const getCars = query({
  args: { 
    includeArchived: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("Available"), v.literal("Sold"), v.literal("Reserved"))),
    condition: v.optional(v.union(v.literal("New"), v.literal("Used"), v.literal("All"))), // إضافة فلتر جديد
  },
  handler: async (ctx, { includeArchived, status, condition }): Promise<Array<Doc<"cars"> & { mainImageUrl?: string | null; imagesUrls: (string | null)[] }>> => {
    // إذا كان الطلب من واجهة الزوار (includeArchived false)، سنعرض غير المؤرشف + المباع المؤرشف
    let carQuery = ctx.db.query("cars");
    
    if (!includeArchived) {
      // أظهر السيارات النشطة (غير مؤرشفة) + السيارات المباعة حتى لو تم أرشفتها للعرض التاريخي
      carQuery = carQuery.filter(q => 
        q.or(
          q.eq(q.field("isArchived"), false),
          q.and(q.eq(q.field("status"), "Sold"), q.eq(q.field("isArchived"), true))
        )
      );
    }

    // إذا تم طلب حالة معينة، نطبقها، لكن للزائر نفضل عرض الكل (متاح + مباع) إذا لم يحدد
    if (status) {
      carQuery = carQuery.filter(q => q.eq(q.field("status"), status));
    }

    const cars = await carQuery.order("desc").collect();

    // تصفية الحالة (بقيت يدوية لأنها تتطلب منطق Not Equal أحياناً)
    const finalCars = condition === "New" ? cars.filter(c => c.condition === "New") : 
                     condition === "Used" ? cars.filter(c => c.condition !== "New") : cars;
    
    return await Promise.all(
      finalCars.map(async (car) => ({
        ...car,
        mainImageUrl: car.mainImage ? await ctx.storage.getUrl(car.mainImage) : null,
        imagesUrls: car.images ? await Promise.all(car.images.map(async (id) => await ctx.storage.getUrl(id))) : [],
      }))
    );
  },
});

/**
 * البحث المتقدم (Global Search)
 */
export const searchCars = query({
  args: { 
    searchTerm: v.string(), 
    make: v.optional(v.string()),
    status: v.optional(v.union(v.literal("Available"), v.literal("Sold"), v.literal("Reserved"))), // إضافة status للفلترة
    location: v.optional(v.string()), // إضافة location للفلترة
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    fuel: v.optional(v.string()),
    transmission: v.optional(v.string()),
  }, 
  handler: async (ctx, { searchTerm, make, status, location, minPrice, maxPrice, fuel, transmission }) => {
    let results: Doc<"cars">[];
    if (searchTerm.length > 0) {
      results = await ctx.db
        .query("cars")
        .withSearchIndex("search_cars", (q) => {
          let search = q.search("searchName", searchTerm);
          
          if (make) search = search.eq("make", make);
          // تعديل: لا نقوم بفرض حالة "Available" افتراضياً، بل نعرض الكل إلا إذا حدد المستخدم الفلتر
          if (status) search = search.eq("status", status);
          if (location) search = search.eq("location", location);
          return search;
        })
        .collect();

      // تطبيق الفلترة الذكية بعد جلب النتائج: أظهر غير مؤرشف + المباع المؤرشف (لعرض تاريخ المبيعات)
      results = results.filter(car => 
        !car.isArchived || (car.status === "Sold" && car.isArchived)
      );
    } else {
      // إصلاح العطل: جلب السيارات مع دعم ظهور المباع المؤرشف في القائمة الرئيسية
      results = await ctx.db.query("cars")
        .filter(q => 
          q.or(
            q.eq(q.field("isArchived"), false),
            q.and(q.eq(q.field("status"), "Sold"), q.eq(q.field("isArchived"), true))
          )
        )
        .order("desc")
        .collect();

      // تطبيق فلتر الحالة يدوياً فقط إذا تم إرساله من الواجهة
      if (status) results = results.filter(c => c.status === status);

      // تصفية إضافية للموقع والماركة إذا تم اختيارهما
      if (location) results = results.filter(c => c.location === location);
      if (make) results = results.filter(c => c.make === make);
    }
    
    // تطبيق فلاتر المدى والمواصفات يدوياً (لأن Search Index في Convex يدعم فقط المساواة)
    if (minPrice !== undefined) results = results.filter(c => c.price >= minPrice);
    if (maxPrice !== undefined) results = results.filter(c => c.price <= maxPrice);
    if (fuel) results = results.filter(c => c.fuel === fuel);
    if (transmission) results = results.filter(c => c.transmission === transmission);

    return await Promise.all(
      results.map(async (car) => ({
        ...car,
        mainImageUrl: car.mainImage ? await ctx.storage.getUrl(car.mainImage) : null,
        imagesUrls: car.images ? await Promise.all(car.images.map(async (id) => await ctx.storage.getUrl(id))) : [],
      }))
    );
  },
});

/**
 * جلب سيارة محددة بواسطة الـ ID
 */
export const getCarById = query({
  args: { carId: v.id("cars") },
  handler: async (ctx, { carId }) => {
    const car = await ctx.db.get(carId);
    if (!car) return null;
    
    return {
      ...car,
      mainImageUrl: car.mainImage ? await ctx.storage.getUrl(car.mainImage) : null,
      imagesUrls: car.images ? await Promise.all(car.images.map(async (id) => await ctx.storage.getUrl(id))) : [],
    };
  },
});

/**
 * وظيفة لتوليد رابط رفع الصور (ضرورية للـ Frontend)
 */
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

/**
 * جلب السيارات القابلة للبيع فقط (المتاحة والمحجوزة وغير المؤرشفة)
 * تستخدم في نموذج تسجيل البيع SaleFormModal لتحسين الأداء
 */
export const getSellableCars = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx) => {
    return await ctx.db
      .query("cars")
      .filter((q) =>
        q.and(
          q.eq(q.field("isArchived"), false),
          q.or(
            q.eq(q.field("status"), "Available"),
            q.eq(q.field("status"), "Reserved")
          )
        )
      )
      .collect();
  },
});