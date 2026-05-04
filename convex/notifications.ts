import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth";

/**
 * جلب الإشعارات غير المقروءة فقط (للتنبيهات السريعة)
 */
export const getUnreadNotifications = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) return [];

    return await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("isRead"), false))
      .order("desc")
      .take(20);
  },
});

/**
 * جلب كافة الإشعارات (سجل التنبيهات الكامل)
 */
export const getAllNotifications = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) return [];

    return await ctx.db
      .query("notifications")
      .order("desc")
      .collect();
  },
});

/**
 * تحديد إشعار معين كمقروء
 */
export const markAsRead = mutation({
  args: { token: v.string(), notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("غير مصرح");

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

/**
 * تحديد كافة الإشعارات كمقروءة (تجربة مستخدم احترافية)
 */
export const markAllAsRead = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("غير مصرح");

    const unreadNotifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

/**
 * حذف إشعار معين
 */
export const deleteNotification = mutation({
  args: { token: v.string(), notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") throw new Error("غير مصرح");

    await ctx.db.delete(args.notificationId);
  },
});