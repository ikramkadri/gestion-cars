import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * دالة مساعدة للتحقق من هوية المستخدم ودوره من جدول المستخدمين
 */
async function getAuthenticatedUser(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("غير مصرح: يجب تسجيل الدخول");
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
    
  if (!user) throw new Error("المستخدم غير موجود في النظام");
  return user;
}

export const addCar = mutation({
  args: {
    make: v.string(),
    model: v.string(),
    year: v.number(),
    imageUrl: v.string(),
    purchasePrice: v.number(),
    price: v.number(),
    mileage: v.number(),
    condition: v.union(v.literal("Excellent"), v.literal("Good"), v.literal("Fair"), v.literal("Poor")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("فقط المدير يمكنه إضافة سيارات");

    const now = new Date().toISOString();
    const carId = await ctx.db.insert("cars", {
      ...args,
      status: "Available",
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLogs", {
      userId: user._id,
      action: "ADD_CAR",
      entity: "cars",
      entityId: carId,
      details: `تم إضافة سيارة: ${args.make} ${args.model}`,
      timestamp: now,
    });

    return carId;
  },
});

export const getPublicCars = query({
  args: { searchQuery: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let cars = await ctx.db
      .query("cars")
      .withIndex("by_status", (q) => q.eq("status", "Available").eq("isArchived", false))
      .order("desc")
      .collect();

    if (args.searchQuery) {
      const q = args.searchQuery.toLowerCase();
      cars = cars.filter(c => 
        c.make.toLowerCase().includes(q) || 
        c.model.toLowerCase().includes(q)
      );
    }
    // حجب سعر الشراء عن العامة لضمان السرية التجارية
    return cars.map(({ purchasePrice, ...rest }) => rest);
  },
});

export const archiveCar = mutation({
  args: { id: v.id("cars") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (user.role !== "admin") throw new Error("صلاحية الأرشفة للمدير فقط");

    const car = await ctx.db.get(args.id);
    if (!car) throw new Error("السيارة غير موجودة");
    if (car.status === "Sold") throw new Error("لا يمكن أرشفة سيارة مبيوعة");

    const now = new Date().toISOString();
    await ctx.db.patch(args.id, { isArchived: true, updatedAt: now });

    await ctx.db.insert("activityLogs", {
      userId: user._id,
      action: "ARCHIVE_CAR",
      entity: "cars",
      entityId: args.id,
      details: `تم أرشفة السيارة ${car.make}`,
      timestamp: now,
    });
  },
});
