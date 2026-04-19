/**
 * المسار: convex/users.ts
 * الوظيفة: مزامنة مستخدمي Clerk مع قاعدة البيانات وإدارة صلاحياتهم.
 */

import { mutation, query } from "./_generated/server";
// تمت إزالة استيراد v من هنا أيضاً لإزالة خطأ Defined but never used

export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized: Clerk login required");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const now = Date.now();
    const email = (identity.emailAddress ?? identity.email ?? "no-email@provided.com") as string;
    const name = (identity.name ?? identity.nickname ?? "User") as string;

    if (user !== null) {
      await ctx.db.patch(user._id, { 
        fullName: name,
        email: email,
        lastLogin: now,
        updatedAt: now 
      });
      return user._id;
    }

    return await ctx.db.insert("users", {
      fullName: name,
      email: email,
      clerkId: identity.subject,
      role: "viewer", 
      lastLogin: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});