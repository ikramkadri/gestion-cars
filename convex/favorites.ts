import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./auth"; // استيراد دالة المصادقة الموحدة

export const toggleFavorite = mutation({
  args: { carId: v.id("cars"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("يجب تسجيل الدخول للإضافة للمفضلة.");

    const existing = await ctx.db.query("favorites")
      .withIndex("by_user_car", (q) => q.eq("userId", user._id).eq("carId", args.carId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { status: "removed" };
    } else {
      await ctx.db.insert("favorites", { userId: user._id, carId: args.carId, createdAt: Date.now() });
      return { status: "added" };
    }
  },
});

export const getMyFavorites = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) return []; // إذا لم يكن هناك مستخدم مصادق عليه، لا توجد مفضلات

    const favorites = await ctx.db.query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
      
    const carPromises = favorites.map(f => ctx.db.get(f.carId));
    const cars = await Promise.all(carPromises);
    return cars.filter(c => c !== null && !c.isArchived);
  },
});