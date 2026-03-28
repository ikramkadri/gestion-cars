
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleFavorite = mutation({
  args: { carId: v.id("cars") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("يجب تسجيل الدخول");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("المستخدم غير موجود");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_car", (q) => q.eq("userId", user._id).eq("carId", args.carId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { status: "removed" };
    } else {
      await ctx.db.insert("favorites", {
        userId: user._id,
        carId: args.carId,
        createdAt: Date.now(),
      });
      return { status: "added" };
    }
  },
});

export const getMyFavorites = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const favoriteCars = await Promise.all(
      favorites.map(async (f) => {
        const car = await ctx.db.get(f.carId);
        return car && !car.isArchived ? car : null;
      })
    );

    return favoriteCars.filter((car) => car !== null);
  },
});
