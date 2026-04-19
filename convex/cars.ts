/**
 * المسار: convex/cars.ts
 * الوظيفة: تحديث دوال الإضافة والتعديل لتشمل الحقول الجديدة (location, hasWarranty, cylinders).
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("غير مصرح");
    return await ctx.storage.generateUploadUrl();
  },
});

export const addCar = mutation({
  args: {
    make: v.string(),
    model: v.string(),
    origin: v.optional(v.string()),
    year: v.number(),
    images: v.array(v.string()),
    mainImage: v.string(),
    purchasePrice: v.number(),
    price: v.number(),
    mileage: v.number(),
    location: v.string(), // جديد
    hasWarranty: v.boolean(), // جديد
    cylinders: v.optional(v.number()), // جديد
    fuel: v.union(v.literal("Gasoline"), v.literal("Diesel"), v.literal("Electric"), v.literal("Hybrid")),
    transmission: v.union(v.literal("Automatic"), v.literal("Manual")),
    drivetrain: v.union(v.literal("FWD"), v.literal("RWD"), v.literal("AWD"), v.literal("4WD")),
    engineSize: v.optional(v.string()),
    color: v.optional(v.string()),
    condition: v.union(v.literal("Excellent"), v.literal("Good"), v.literal("Fair"), v.literal("Poor")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("غير مصرح");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user || user.role === "viewer") throw new Error("لا تملك صلاحية الإضافة");

    const now = Date.now();
    const carId = await ctx.db.insert("cars", {
      ...args,
      status: "Available",
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("notifications", {
      title: "إضافة سيارة جديدة 🚗",
      message: `تمت إضافة ${args.make} ${args.model} في ${args.location} بنجاح.`,
      type: "success",
      isRead: false,
      createdAt: now,
    });

    return carId;
  },
});

export const getCars = query({
  args: { 
    includeArchived: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("Available"), v.literal("Sold")))
  },
  handler: async (ctx, args) => {
    let carsQuery;
    if (args.status) {
      carsQuery = ctx.db.query("cars")
        .withIndex("by_status_archived", (q) => 
          q.eq("status", args.status!).eq("isArchived", args.includeArchived ?? false)
        );
    } else {
      carsQuery = ctx.db.query("cars")
        .withIndex("by_archived", (q) => 
          q.eq("isArchived", args.includeArchived ?? false)
        );
    }

    const results = await carsQuery.order("desc").collect();

    return await Promise.all(
      results.map(async (car) => ({
        ...car,
        mainImage: car.mainImage ? await ctx.storage.getUrl(car.mainImage) : null,
        images: await Promise.all(
          car.images.map(async (id) => await ctx.storage.getUrl(id))
        ),
      }))
    );
  },
});

export const getCarById = query({
  args: { carId: v.id("cars") },
  handler: async (ctx, args) => {
    const car = await ctx.db.get(args.carId);
    if (!car) return null;
    return {
      ...car,
      mainImage: car.mainImage ? await ctx.storage.getUrl(car.mainImage) : null,
      images: await Promise.all(
        car.images.map(async (id) => await ctx.storage.getUrl(id))
      ),
    };
  },
});

export const updateCar = mutation({
  args: {
    carId: v.id("cars"),
    updates: v.object({
      make: v.optional(v.string()),
      model: v.optional(v.string()),
      origin: v.optional(v.string()),
      year: v.optional(v.number()),
      description: v.optional(v.string()),
      images: v.optional(v.array(v.string())),
      mainImage: v.optional(v.string()),
      price: v.optional(v.number()),
      mileage: v.optional(v.number()),
      location: v.optional(v.string()), // جديد
      hasWarranty: v.optional(v.boolean()), // جديد
      cylinders: v.optional(v.number()), // جديد
      status: v.optional(v.union(v.literal("Available"), v.literal("Sold"))),
      isArchived: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("غير مصرح");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role === "viewer") {
      throw new Error("لا تملك صلاحية تعديل البيانات");
    }

    await ctx.db.patch(args.carId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return args.carId;
  },
});

export const archiveCar = mutation({
  args: { carId: v.id("cars") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("غير مصرح");

    await ctx.db.patch(args.carId, {
      isArchived: true,
      archivedAt: Date.now(),
    });
  },
});