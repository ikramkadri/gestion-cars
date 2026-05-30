import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth"; // Import getAuthenticatedUser

/**
 * جلب إعدادات الموقع العامة
 */
export const getSettings = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("site_settings").unique();
  },
});

/**
 * تحديث إعدادات الموقع (للأدمن فقط)
 */
export const updateSettings = mutation({
  args: {
    token: v.string(),
    showroomName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactWhatsApp: v.optional(v.string()),
    address: v.optional(v.string()),
    currency: v.optional(v.string()),
    logoImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx: MutationCtx, args) => {
    const { token, ...updates } = args;
    const user = await getAuthenticatedUser(ctx, token);
    if (!user || user.role !== "admin") throw new Error("غير مصرح لك بتعديل الإعدادات.");
    
    const settings = await ctx.db.query("site_settings").unique();
    if (!settings) throw new Error("إعدادات الموقع غير موجودة.");

    await ctx.db.patch(settings._id, { ...updates, updatedAt: Date.now() });
  },
});