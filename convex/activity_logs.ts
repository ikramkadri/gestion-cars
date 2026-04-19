/**
 * المسار: convex/activity_logs.ts
 * الوظيفة: جلب سجلات النشاط لربطها بأسماء المستخدمين.
 */

import { query } from "./_generated/server";
// تمت إزالة استيراد v لأنه غير مستخدم هنا

export const getLatestLogs = query({
  handler: async (ctx) => {
    const logs = await ctx.db
      .query("activity_logs")
      .order("desc")
      .take(50);

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