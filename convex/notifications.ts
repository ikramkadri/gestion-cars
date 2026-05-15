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

    const query = ctx.db.query("notifications");

    // إذا كان مديراً، يرى إشعارات النظام العامة (userId غير محدد)
    if (user.role === "admin" || user.role === "sales_manager") {
      return await query
        .filter((q) => q.and(q.eq(q.field("isRead"), false), q.eq(q.field("userId"), undefined)))
        .order("desc")
        .take(20);
    }

    // إذا كان زبوناً، يرى إشعاراته الخاصة فقط
    return await query
      .withIndex("by_user", (q) => q.eq("userId", user._id))
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

    const query = ctx.db.query("notifications");

    // تصفية المحتوى بناءً على الصلاحية (فئة المستخدم)
    if (user.role === "admin" || user.role === "sales_manager") {
      return await query
        .filter((q) => q.eq(q.field("userId"), undefined))
        .order("desc")
        .collect();
    }

    return await query
      .withIndex("by_user", (q) => q.eq("userId", user._id))
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

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("التنبيه غير موجود");

    // التحقق من الملكية: إما إشعار عام للمدراء أو إشعار خاص للمستخدم
    const isAdmin = user.role === "admin" || user.role === "sales_manager";
    const isOwner = notification.userId === user._id;

    if (isOwner || (isAdmin && !notification.userId)) {
      await ctx.db.patch(args.notificationId, { isRead: true });
    }
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

    const isAdmin = user.role === "admin" || user.role === "sales_manager";
    
    let unreadQuery;
    if (isAdmin) {
      unreadQuery = ctx.db.query("notifications")
        .filter((q) => q.and(
          q.eq(q.field("isRead"), false),
          q.eq(q.field("userId"), undefined)
        ));
    } else {
      unreadQuery = ctx.db.query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("isRead"), false));
    }

    const unreadNotifications = await unreadQuery.collect();

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