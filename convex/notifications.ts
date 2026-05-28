import { query, mutation, internalMutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth";

/**
 * جلب عدد الإشعارات غير المقروءة للمستخدم الحالي أو الإشعارات العامة
 */
export const getUnreadCount = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx: QueryCtx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_read_status", (q) => q.eq("isRead", false))
      .collect();

    if (args.token && args.token !== "") {
      const user = await getAuthenticatedUser(ctx, args.token);
      if (user) {
        const isManager = user.role === "admin" || user.role === "sales_manager";
        return unread.filter((n) => 
          n.userId === user._id || (isManager && !n.userId)
        ).length;
      }
    }
    return 0; // لا يتم عرض إشعارات إذا لم يكن هناك مستخدم مسجل
  },
});

/**
 * جلب التنبيهات غير المقروءة (للمكون العائم NotificationBell)
 */
export const getUnreadNotifications = query({
  args: { token: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) return [];
    
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_read_status", (q) => q.eq("isRead", false))
      .collect();

    const isManager = user.role === "admin" || user.role === "sales_manager";
    return unread
      .filter((n) => n.userId === user._id || (isManager && !n.userId))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * جلب كافة التنبيهات (لصفحة الإشعارات الكاملة)
 */
export const getAllNotifications = query({
  args: { token: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) return [];

    const all = await ctx.db.query("notifications").collect();
    const isManager = user.role === "admin" || user.role === "sales_manager";
    return all
      .filter(n => n.userId === user._id || (isManager && !n.userId))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * تحديد إشعار كمقروء
 */
export const markAsRead = mutation({
  args: { token: v.string(), notificationId: v.id("notifications") },
  handler: async (ctx: MutationCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("Unauthorized");

    const notif = await ctx.db.get(args.notificationId);
    if (notif && (!notif.userId || notif.userId === user._id || user.role === "admin")) {
      await ctx.db.patch(args.notificationId, { isRead: true });
    }
  },
});

/**
 * تحديد الكل كمقروء
 */
export const markAllAsRead = mutation({
  args: { token: v.string() },
  handler: async (ctx: MutationCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("Unauthorized");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_read_status", (q) => q.eq("isRead", false))
      .collect();

    const isManager = user.role === "admin" || user.role === "sales_manager";
    for (const notif of unread) {
      const isMyNotification = notif.userId === user._id;
      const isManagerNotification = isManager && !notif.userId;

      if (isMyNotification || isManagerNotification) {
        await ctx.db.patch(notif._id, { isRead: true });
      }
    }
  },
});

export const deleteNotification = mutation({
  args: { token: v.string(), notificationId: v.id("notifications") },
  handler: async (ctx: MutationCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") throw new Error("Admin access required");
    await ctx.db.delete(args.notificationId);
  },
});

export const clearAllNotifications = mutation({
  args: { token: v.optional(v.string()) },
  handler: async (ctx: MutationCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") throw new Error("صلاحية الأدمن مطلوبة.");

    const notifs = await ctx.db.query("notifications").collect();
    for (const n of notifs) {
      await ctx.db.delete(n._id);
    }
    return `تم حذف ${notifs.length} إشعار بنجاح.`;
  },
});

/**
 * دالة داخلية لحذف الإشعارات القديمة (أكثر من 30 يوماً)
 * تُستدعى بواسطة Cron Job
 */
export const clearOldNotifications = internalMutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const oldNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", thirtyDaysAgo))
      .collect();

    for (const notif of oldNotifications) await ctx.db.delete(notif._id);
    console.log(`[Cleanup] Deleted ${oldNotifications.length} old notifications.`);
  },
});