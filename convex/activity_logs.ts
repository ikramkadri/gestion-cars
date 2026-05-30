/**
 * المسار: convex/activity_logs.ts
 * الوظيفة: جلب آخر النشاطات التي حدثت في النظام.
 */
import { query, internalMutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth"; // استيراد دالة المصادقة الموحدة

export const getLatestLogs = query({
  args: { limit: v.optional(v.number()), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) return []; // إذا لم يكن هناك مستخدم مصادق عليه، لا نعرض سجلات النشاط

    const logs = await ctx.db
      .query("activity_logs")
      .order("desc")
      .take(args.limit ?? 10); // استخدام createdAt للترتيب

    return await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          userName: user?.fullName || "مستخدم غير معروف",
        };
      })
    );
  },
});

/**
 * دالة داخلية لحذف سجلات النشاط القديمة (أكثر من 90 يوماً)
 * تُستدعى بواسطة Cron Job
 */
export const clearOldLogs = internalMutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    const oldLogs = await ctx.db
      .query("activity_logs")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", ninetyDaysAgo))
      .collect();

    for (const log of oldLogs) await ctx.db.delete(log._id);
    console.log(`[Cleanup] Deleted ${oldLogs.length} old activity logs.`);
  },
});

