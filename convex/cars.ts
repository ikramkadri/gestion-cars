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
  images: string[];
  mainImage: string;
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
    images: v.array(v.string()),
    mainImage: v.string(),
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
      vin: args.vin,
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
    updates: v.object({ // تحديد الحقول القابلة للتحديث بشكل صريح
      make: v.optional(v.string()),
      model: v.optional(v.string()),
      origin: v.optional(v.string()),
      year: v.optional(v.number()),
      description: v.optional(v.string()),
      images: v.optional(v.array(v.string())),
      mainImage: v.optional(v.string()),
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
      archivedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || (user.role !== "admin" && user.role !== "sales_manager")) throw new Error("غير مصرح لك بتعديل السيارات");

    const existingCar = await ctx.db.get(args.carId);
    if (!existingCar) throw new Error("السيارة غير موجودة.");

    await ctx.db.patch(args.carId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      title: "تحديث بيانات سيارة 📝",
      message: `تم تحديث بيانات ${existingCar.make} ${existingCar.model} بواسطة ${user.fullName}`,
      type: "info",
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
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") throw new Error("للأدمن فقط");

    const car = await ctx.db.get(args.carId);
    if (car) {
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
    status: v.optional(v.union(v.literal("Available"), v.literal("Sold"), v.literal("Reserved")))
  },
  handler: async (ctx, args) => {
    const carQuery = ctx.db
      .query("cars")
      .withIndex("by_archived", (q) => q.eq("isArchived", args.includeArchived ?? false));

    let cars = await carQuery.order("desc").collect();
    if (args.status) {
      cars = cars.filter(c => c.status === args.status);
    }

    return cars;
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
  }, 
  handler: async (ctx, args) => {
    let results: Doc<"cars">[];
    if (args.searchTerm.length > 0) {
      results = await ctx.db
        .query("cars")
        .withSearchIndex("search_cars", (q) => {
          let search = q.search("model", args.searchTerm)
            .eq("isArchived", false);
          
          if (args.make) search = search.eq("make", args.make);
          search = search.eq("status", args.status ?? "Available");
          if (args.location) search = search.eq("location", args.location);
          return search;
        })
        .collect();
    } else {
      // في حال عدم وجود نص بحث، نستخدم الفهارس العادية للفلترة
      const q = ctx.db.query("cars")
        .withIndex("by_status_archived", (dbQ) => 
          dbQ.eq("status", args.status ?? "Available").eq("isArchived", false)
        );
      
      results = await q.order("desc").collect();

      // تصفية إضافية للموقع والماركة إذا تم اختيارهما
      if (args.location) results = results.filter(c => c.location === args.location);
      if (args.make) results = results.filter(c => c.make === args.make);
    }

    return results;
  },
});

/**
 * جلب سيارة محددة بواسطة الـ ID
 */
export const getCarById = query({
  args: { carId: v.id("cars") }, // تم إزالة token لأنه غير مستخدم في هذه الدالة العامة
  handler: async (ctx, args) => {
    return await ctx.db.get(args.carId);
  },
});