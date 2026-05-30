import { mutation, query, action, internalMutation, internalQuery, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import * as bcrypt from "bcryptjs"; 

const SESSION_EXPIRATION_MS = 1000 * 60 * 60 * 24 * 7; // الجلسة صالحة لمدة 7 أيام

/**
 * دالة مساعدة لجلب المستخدم من الجلسة (تُستخدم داخلياً)
 */
export async function getAuthenticatedUser(
  ctx: QueryCtx | MutationCtx, 
  token?: string
): Promise<Doc<"users"> | null> {
  if (!token) return null;

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();

  if (!session || session.expires < Date.now()) {
    if (session && "delete" in ctx.db) {
       await ctx.db.delete(session._id);
    }
    return null;
  }

  return await ctx.db.get(session.userId);
}

/**
 * دالة تسجيل الدخول: إنشاء أو تحديث المستخدم ومنحه توكن جديد
 */
export const authenticate = action({
  args: { email: v.string(), name: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<{ token: string; user: Doc<"users"> }> => {
    const email = args.email.toLowerCase().trim();

    // 1. البحث عن المستخدم عبر Query داخلي
    const user = await ctx.runQuery(internal.auth.getUserByEmailInternal, { email });

    if (user) {
      // 2. التحقق من كلمة المرور
      const passwordMatch = await bcrypt.compare(args.password, user.password);
      if (!passwordMatch) {
        throw new Error("كلمة المرور غير صحيحة");
      }
      // 3. إنشاء جلسة لمستخدم موجود
      return await ctx.runMutation(internal.auth.createSessionInternal, { userId: user._id });
    }

    // 4. تشفير كلمة المرور لمستخدم جديد والتسجيل عبر Mutation داخلي
    const hashedPassword = await bcrypt.hash(args.password, 10);
    const result = await ctx.runMutation(internal.auth.registerUserInternal, {
      email,
      name: args.name,
      password: hashedPassword,
    });

    return result;
  },
});

export const getUserByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const registerUserInternal = internalMutation({
  args: { email: v.string(), name: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      fullName: args.name,
      email: args.email,
      password: args.password,
      role: "viewer", // الافتراضي هو مشاهد، والأدمن يتم تعيينه يدوياً عبر Dashboard
      status: "pending",
      verified: false,
      createdAt: now,
      updatedAt: now,
    });

    const sessionToken = Math.random().toString(36).substring(2) + now.toString();
    const expires = now + SESSION_EXPIRATION_MS;

    await ctx.db.insert("sessions", {
      userId,
      token: sessionToken,
      expires,
    });

    await ctx.db.patch(userId, { 
      lastLogin: now, 
      updatedAt: now 
    });

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Failed to retrieve user after registration."); // إضافة تحقق لضمان عدم وجود null
    return { token: sessionToken, user };
  },
});

export const createSessionInternal = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sessionToken = Math.random().toString(36).substring(2) + now.toString();
    const expires = now + SESSION_EXPIRATION_MS;

    await ctx.db.insert("sessions", {
      userId: args.userId,
      token: sessionToken,
      expires,
    });

    await ctx.db.patch(args.userId, { 
      lastLogin: now, 
      updatedAt: now 
    });

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("Failed to retrieve user after session creation."); // إضافة تحقق لضمان عدم وجود null
    return { token: sessionToken, user };
  },
});

export const getUserByIdInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * جلب بيانات المستخدم الحالية
 */
export const currentUser = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await getAuthenticatedUser(ctx, args.token);
  },
});

/**
 * تسجيل الخروج
 */
export const signOut = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});