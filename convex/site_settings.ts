// convex/site_settings.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth"; // Assuming this utility exists

export const getSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("site_settings").unique();
    return settings;
  },
});

export const updateSettings = mutation({
  args: {
    token: v.string(),
    showroomName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactWhatsApp: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    address: v.optional(v.string()),
    currency: v.optional(v.string()),
    logoImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") {
      throw new Error("غير مصرح لك بتعديل إعدادات الموقع.");
    }

    const existingSettings = await ctx.db.query("site_settings").unique();

    const updates = {
      showroomName: args.showroomName,
      contactPhone: args.contactPhone,
      contactWhatsApp: args.contactWhatsApp,
      contactEmail: args.contactEmail,
      address: args.address,
      currency: args.currency,
      logoImageId: args.logoImageId,
      updatedAt: Date.now(),
    };

    // Filter out undefined values to avoid overwriting with null
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, filteredUpdates);
      return existingSettings._id;
    } else {
      // If no settings exist, create them
      const newSettings = {
        showroomName: args.showroomName || "MOTORIX",
        contactPhone: args.contactPhone || "",
        contactWhatsApp: args.contactWhatsApp,
        contactEmail: args.contactEmail || "",
        address: args.address || "",
        currency: args.currency || "DZD",
        logoImageId: args.logoImageId,
        updatedAt: Date.now(),
      };
      return await ctx.db.insert("site_settings", newSettings);
    }
  },
});