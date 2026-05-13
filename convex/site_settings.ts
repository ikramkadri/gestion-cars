/**
 * المسار: convex/site_settings.ts
 * الوظيفة: التحكم في هوية المعرض (الاسم، العنوان، العملة) من لوحة التحكم.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("site_settings").first();
    if (!settings) return null;

    let logoUrl = null;
    if (settings.logoImageId) {
      logoUrl = await ctx.storage.getUrl(settings.logoImageId);
    }
    return { ...settings, logoUrl };
  },
});

export const updateSettings = mutation({
  args: {
    showroomName: v.string(), 
    contactPhone: v.string(),
    contactEmail: v.string(), 
    address: v.string(),
    currency: v.string(),
    logoImageId: v.optional(v.id("_storage")), // إضافة حقل لمعرف صورة الشعار
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("site_settings").first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("site_settings", { ...args, updatedAt: Date.now() });
    }
  },
});