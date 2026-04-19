import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * جلب الإشعارات غير المقروءة فقط، مرتبة من الأحدث إلى الأقدم.
 */
export const getNotifications = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db.query("notifications")
      .withIndex("by_read_status", (q) => q.eq("isRead", false))
      .order("desc")
      .take(args.limit ?? 50);
  },
});

/**
 * دالة لتحديد جميع الإشعارات كـ "مقروءة" دفعة واحدة.
 */
export const markAllAsRead = mutation({
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_read_status", (q) => q.eq("isRead", false))
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});