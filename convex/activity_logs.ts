/**
 * المسار: convex/activity_logs.ts
 * الوظيفة: جلب آخر النشاطات التي حدثت في النظام.
 */

import { query } from "./_generated/server";
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
      .take(args.limit ?? 10);

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