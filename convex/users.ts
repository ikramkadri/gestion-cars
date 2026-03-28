import { mutation, query } from "./_generated/server";

export const storeUser = mutation({
  args: {}, 
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("غير مصرح: يجب تسجيل الدخول عبر Clerk");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const now = Date.now();
    
    // حل مشكلة النوع وتعدد الحقول في Clerk
    const email = (identity.emailAddress ?? identity.email ?? "no-email@provided.com") as string;
    const name = (identity.name ?? identity.nickname ?? "مستخدم جديد") as string;

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
