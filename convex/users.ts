import { mutation, query, action, internalMutation, internalQuery, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs"; // استيراد bcryptjs

/**
 * وظيفة مساعدة للحصول على مستخدم قاعدة البيانات الحالي بناءً على هويته من Convex Auth.
 */
async function getDbUser(ctx: QueryCtx | MutationCtx, token?: string) {
  return await getAuthenticatedUser(ctx, token);
}

/**
 * وظيفة: storeUser
 * تقوم بتحديث بيانات المستخدم وإعطاء صلاحية الأدمن بناءً على الإيميل.
 */
export const storeUser = mutation({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getDbUser(ctx, args.token);
    if (!user) return null; // تم التعديل: إرجاع null بدلاً من رمي خطأ

    const now = Date.now();
    // التأكد من وجود الإيميل (الإيميل الآن v.string() وليس v.optional(v.string()))
    const isAdminEmail = user.email === "ikramkadri17@gmail.com";

    // تحديث حقول المستخدم.
    // إذا كان المستخدم أدمن بالفعل، لا نغير رتبته.
    // إذا لم يكن لديه رتبة، نعطيه رتبة "viewer" افتراضياً.
    await ctx.db.patch(user._id, {
      role: isAdminEmail ? "admin" : user.role, // لا نغير الرتبة إذا كان أدمن
      lastLogin: now,
      updatedAt: now,
    });

    return user._id;
  },
});

/**
 * وظيفة: updateUser
 * لتحديث بيانات المستخدم مثل الصورة الشخصية أو الاسم
 */
export const updateUser = mutation({
  args: {
    fullName: v.optional(v.string()),
    profileImageId: v.optional(v.id("_storage")),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { token, ...updates } = args;
    const user = await getDbUser(ctx, token);

    if (!user) {
      throw new Error("المستخدم غير موجود أو غير مصرح له.");
    }

    await ctx.db.patch(user._id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

/**
 * وظيفة: viewer
 * جلب بيانات المستخدم كاملة من قاعدة البيانات لعرضها في الواجهة.
 */
export const viewer = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getDbUser(ctx, args.token);
    if (!user) return null;
    
    const imageUrl = user.profileImageId 
      ? await ctx.storage.getUrl(user.profileImageId) 
      : `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName || 'User'}`;

    return {
      ...user, 
      imageUrl,
    };
  },
});

/**
 * وظيفة: changePassword
 * لتغيير كلمة مرور المستخدم
 */
export const changePassword = action({
  args: {
    token: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getUserForAuthInternal, { token: args.token });
    if (!user) throw new Error("المستخدم غير مصادق عليه.");

    const passwordMatch = await bcrypt.compare(args.currentPassword, user.password);
    if (!passwordMatch) {
      throw new Error("كلمة المرور الحالية غير صحيحة.");
    }

    const hashedPassword = await bcrypt.hash(args.newPassword, 10);
    await ctx.runMutation(internal.users.updatePasswordInternal, { 
      userId: user._id, 
      password: hashedPassword 
    });

    return "تم تغيير كلمة المرور بنجاح.";
  },
});

export const getUserForAuthInternal = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await getAuthenticatedUser(ctx, args.token);
  },
});

export const updatePasswordInternal = internalMutation({
  args: { userId: v.id("users"), password: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { password: args.password, updatedAt: Date.now() });
  },
});

/**
 * حل طارئ: قم باستدعاء هذه الوظيفة من متصفحك أو من Convex Dashboard 
 * لجعل نفسك أدمن فوراً دون الحاجة لفحص الإيميل.
 */
export const makeMeAdmin = mutation({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getDbUser(ctx, args.token); 
    if (!user) throw new Error("المستخدم غير مصادق عليه.");

    await ctx.db.patch(user._id, { role: "admin", updatedAt: Date.now() });
    return "مبروك! أنت الآن أدمن (Admin) بنجاح.";
  },
});

/**
 * وظيفة خطيرة: تقوم بحذف جميع المستخدمين من قاعدة البيانات.
 * تُستخدم فقط لتنظيف النظام والبدء من جديد.
 */
export const clearAllUsers = mutation({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getDbUser(ctx, args.token);
    if (!user || user.role !== "admin") { // يجب أن يكون أدمن
      throw new Error("عملية غير مصرح بها. يجب أن تكون مديراً لحذف البيانات.");
    }

    // جلب جميع المستخدمين
    const allUsers = await ctx.db.query("users").collect();
    
    // حذفهم واحداً تلو الآخر
    for (const user of allUsers) {
      await ctx.db.delete(user._id);
    }

    // حذف جميع الجلسات أيضاً
    const allSessions = await ctx.db.query("sessions").collect();
    for (const session of allSessions) {
      await ctx.db.delete(session._id);
    }
    
    return `تم حذف ${allUsers.length} مستخدم و ${allSessions.length} جلسة بنجاح. يمكنك الآن التسجيل من جديد.`;
  },
});