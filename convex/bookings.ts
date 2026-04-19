import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createBooking = mutation({
  args: { carId: v.id("cars"), bookingDate: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("يجب تسجيل الدخول للحجز");
    const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user) throw new Error("المستخدم غير موجود");

    const car = await ctx.db.get(args.carId);
    if (!car || car.status !== "Available" || car.isArchived) throw new Error("عذراً، هذه السيارة غير متاحة");

    const bookingId = await ctx.db.insert("bookings", {
      carId: args.carId, userId: user._id, bookingDate: args.bookingDate, status: "pending", createdAt: Date.now(),
    });

    await ctx.db.insert("notifications", { title: "طلب حجز جديد 📅", message: `قام ${user.fullName} بحجز موعد`, type: "warning", isRead: false, createdAt: Date.now() });
    return bookingId;
  },
});

export const getMyBookings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user) return [];
    const bookings = await ctx.db.query("bookings").withIndex("by_user", (q) => q.eq("userId", user._id)).collect();
    return await Promise.all(bookings.map(async (b) => ({ ...b, car: await ctx.db.get(b.carId) })));
  },
});

export const updateBookingStatus = mutation({
  args: { bookingId: v.id("bookings"), status: v.union(v.literal("confirmed"), v.literal("cancelled")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { status: args.status });
  },
});