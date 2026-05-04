import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth";
import { Doc, Id } from "./_generated/dataModel";

/**
 * تعريف نوع بيانات السيارة لضمان مطابقة الـ Schema تماماً وتجنب أخطاء TypeScript
 */
interface CarInsertData {
  make: string;
  model: string;
  origin?: string;
  year: number;
  description?: string;
  images: Id<"_storage">[]; // تم التغيير لتخزين معرفات التخزين
  mainImage: Id<"_storage">; // تم التغيير لتخزين معرف التخزين الرئيسي
  purchasePrice: number;
  price: number;
  mileage: number;
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
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  viewCount: number;
  status: "Available" | "Sold"; 
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
    images: v.array(v.id("_storage")), // تم التغيير لتخزين معرفات التخزين
    mainImage: v.id("_storage"), // تم التغيير لتخزين معرف التخزين الرئيسي
    purchasePrice: v.number(),
    price: v.number(),
    mileage: v.number(),
    location: v.string(),
    hasWarranty: v.boolean(),
    cylinders: v.optional(v.number()),
    fuel: v.union(v.literal("Gasoline"), v.literal("Diesel"), v.literal("Electric"), v.literal("Hybrid")),
    transmission: v.union(v.literal("Automatic"), v.literal("Manual")),
    drivetrain: v.union(v.literal("FWD"), v.literal("RWD"), v.literal("AWD"), v.literal("4WD")),
    engineSize: v.optional(v.string()),
    color: v.optional(v.string()),
    condition: v.union(v.literal("Excellent"), v.literal("Good"), v.literal("Fair"), v.literal("Poor")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role === "viewer") {
      throw new Error("عذراً، لا تملك صلاحية إضافة سيارات.");
    }

    const now = Date.now();
    const slug = `${args.make}-${args.model}-${now}`.toLowerCase().replace(/ /g, "-");
    const carData: CarInsertData = {
      make: args.make,
      model: args.model,
      origin: args.origin,
      year: args.year,
      description: args.description,
      images: args.images,
      mainImage: args.mainImage,
      purchasePrice: args.purchasePrice,
      price: args.price,
      mileage: args.mileage,
      location: args.location,
      sellerId: user._id,
      slug: slug,
      hasWarranty: args.hasWarranty,
      cylinders: args.cylinders,
      fuel: args.fuel,
      transmission: args.transmission,
      drivetrain: args.drivetrain,
      engineSize: args.engineSize,
      color: args.color,
      condition: args.condition,
      viewCount: 0,
      status: "Available",
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    const carId = await ctx.db.insert("cars", carData);

    await ctx.db.insert("notifications", {
      title: "سيارة جديدة بالمخزن 🚘",
      message: `تمت إضافة ${args.make} ${args.model} بواسطة ${user.fullName}`,
      type: "success",
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
    updates: v.any(), // يمكن تخصيصها لاحقاً لتدقيق الحقول
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role === "viewer") throw new Error("غير مصرح لك");

    await ctx.db.patch(args.carId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

/**
 * حذف سيارة نهائياً مع حذف صورها من التخزين (إدارة موارد عالمية)
 */
export const deleteCar = mutation({
  args: { token: v.string(), carId: v.id("cars") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") throw new Error("للأدمن فقط");

    const car = await ctx.db.get(args.carId);
    if (car) {
      // حذف الصورة الرئيسية من التخزين السحابي لتوفير المساحة
      if (car.mainImage) await ctx.storage.delete(car.mainImage);
      // حذف مصفوفة الصور
      for (const imgId of car.images) {
        await ctx.storage.delete(imgId);
      }
      await ctx.db.delete(args.carId);
    }
  },
});

/**
 * جلب السيارات مع تصفية متقدمة (Pagination & Filtering)
 */
export const getCars = query({
  args: { 
    includeArchived: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("Available"), v.literal("Sold")))
  },
  handler: async (ctx, args) => {
    const carQuery = ctx.db
      .query("cars")
      .withIndex("by_archived", (q) => q.eq("isArchived", args.includeArchived ?? false))
      .filter(q => args.status ? q.eq(q.field("status"), args.status) : true); // استخدام الفهرس لتصفية الحالة

    const cars = await carQuery.order("desc").collect();

    return await Promise.all(
      cars.map(async (car: Doc<"cars">) => {
        // تحويل معرفات التخزين إلى روابط URL
        const mainImageUrl = car.mainImage ? await ctx.storage.getUrl(car.mainImage) : null;
        const imagesUrls = await Promise.all(
          car.images.map(async (imgId: Id<"_storage">) => {
            // التأكد من أن imgId ليس null أو undefined قبل استخدامه
            return imgId ? await ctx.storage.getUrl(imgId) : null;
          })
        );
        return {
          ...car,
          mainImageUrl,
          imagesUrls,
        };
      })
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
    status: v.optional(v.union(v.literal("Available"), v.literal("Sold"))), // إضافة status للفلترة
    location: v.optional(v.string()), // إضافة location للفلترة
  }, 
  handler: async (ctx, args) => {
    let results: Doc<"cars">[];
    if (args.searchTerm.length > 0) {
      results = await ctx.db
        .query("cars")
        .withSearchIndex("search_cars", (q) => {
          let search = q.search("model", args.searchTerm);
          if (args.make) search = search.eq("make", args.make);
          if (args.status) search = search.eq("status", args.status);
          if (args.location) search = search.eq("location", args.location);
          return search;
        })
        .collect();
    } else {
      results = await ctx.db.query("cars").order("desc").collect();
    }

    // تحويل معرفات التخزين إلى روابط URL للنتائج
    return await Promise.all(results.map(async (car: Doc<"cars">) => {
      const mainImageUrl = car.mainImage ? await ctx.storage.getUrl(car.mainImage) : null;
      const imagesUrls = await Promise.all(
        car.images.map(async (imgId: Id<"_storage">) => {
          return imgId ? await ctx.storage.getUrl(imgId) : null;
        })
      );
      return { ...car, mainImageUrl, imagesUrls };
    }));
  },
});

/**
 * جلب سيارة محددة بواسطة الـ ID
 */
export const getCarById = query({
  args: { carId: v.id("cars") }, // تم إزالة token لأنه غير مستخدم في هذه الدالة العامة
  handler: async (ctx, args) => {
    const car = await ctx.db.get(args.carId);
    if (!car) return null;
    
    // يمكن إضافة فحص صلاحيات هنا إذا كانت تفاصيل السيارة حساسة، لكنها حالياً عامة
    // const user = await getAuthenticatedUser(ctx, args.token); 

    return {
      ...car,
      mainImageUrl: car.mainImage ? await ctx.storage.getUrl(car.mainImage) : null, // تحويل معرف التخزين إلى رابط URL
      imagesUrls: await Promise.all(
        car.images.map(async (imgId: Id<"_storage">) => {
          return imgId ? await ctx.storage.getUrl(imgId) : null; // تحويل معرفات التخزين إلى روابط URL
        })
      ),
    };
  },
});

/**
 * توليد رابط رفع الصور
 */
export const generateUploadUrl = mutation({
  args: { token: v.optional(v.string()) }, // جعل التوكن اختياري هنا
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("يجب تسجيل الدخول لرفع الصور");
    return await ctx.storage.generateUploadUrl();
  },
});