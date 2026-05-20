import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth";

// دالة إضافة/إزالة السيارة من المفضلة
export const toggleFavorite = mutation({
  args: { token: v.string(), carId: v.id("cars") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("يجب تسجيل الدخول للإضافة للمفضلة.");

    const existingFavorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_car", (q) =>
        q.eq("userId", user._id).eq("carId", args.carId)
      )
      .first();

    if (existingFavorite) {
      // السيارة موجودة في المفضلة، نقوم بحذفها
      await ctx.db.delete(existingFavorite._id);
      return { status: "removed", favoriteCount: -1 };
    } else {
      // السيارة غير موجودة، نقوم بإضافتها
      await ctx.db.insert("favorites", {
        userId: user._id,
        carId: args.carId,
        createdAt: Date.now(),
      });
      return { status: "added", favoriteCount: 1 };
    }
  },
});

// دالة جلب مفضلات المستخدم الحالي
export const getMyFavorites = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) return [];

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      favorites.map(async (fav) => ctx.db.get(fav.carId))
    );
  },
});

// دالة جديدة: جلب عدد الإعجابات (المفضلة) لسيارة معينة
export const getCarFavoriteCount = query({
  args: { carId: v.id("cars") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db.query("favorites").filter((q) => q.eq(q.field("carId"), args.carId)).collect();
    return favorites.length;
  },
});