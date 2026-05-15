import { query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * جلب إعدادات الموقع العامة (مثل أرقام التواصل، اسم المعرض، إلخ)
 */
export const getSiteSettings = query({
  args: {},
  handler: async (ctx): Promise<Doc<"site_settings"> | null> => {
    return await ctx.db.query("site_settings").first();
  },
});