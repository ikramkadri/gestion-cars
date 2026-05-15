import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth";

/**
 * إضافة مصروف تشغيلي جديد
 */
export const addExpense = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    category: v.union(
      v.literal("Rent"),
      v.literal("Utilities"),
      v.literal("Salaries"),
      v.literal("Marketing"),
      v.literal("Maintenance"),
      v.literal("Other")
    ),
    amount: v.number(),
    date: v.number(),
    carId: v.optional(v.id("cars")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") {
      throw new Error("عذراً، صلاحية الإدمن فقط مطلوبة لتسجيل المصاريف.");
    }

    const expenseId = await ctx.db.insert("expenses", {
      title: args.title,
      category: args.category,
      amount: args.amount,
      date: args.date,
      carId: args.carId,
      addedBy: user._id,
    });

    // تسجيل النشاط لضمان الشفافية المالية
    await ctx.db.insert("activity_logs", {
      action: "EXPENSE_ADDED",
      details: `تسجيل مصروف: ${args.title} بقيمة ${args.amount.toLocaleString()} دج`,
      userId: user._id,
      timestamp: Date.now(),
    });

    return expenseId;
  },
});

export const getExpenses = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") throw new Error("غير مصرح لك.");
    return await ctx.db.query("expenses").order("desc").collect();
  },
});