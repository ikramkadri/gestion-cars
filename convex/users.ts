import { mutation, query, action, internalMutation, internalQuery, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth";
import { internal } from "./_generated/api";
import * as bcrypt from "bcryptjs";
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
    
    // التحقق من الإيميل الخاص بالأدمن للترقية التلقائية (اختياري)
    const isAdminEmail = user.email === "admin_motorix@gmail.com" || user.email.includes("admin"); 
    const finalRole = isAdminEmail ? "admin" : (user.role || "viewer");
    
    // جعل حالة الزبون الجديد "معلق" حتى يقبله الأدمن
    const currentStatus = user.status || (isAdminEmail ? "active" : "pending");
    // تحديد حالة التحقق: الأدمن موثق تلقائياً، والزبون الجديد يبدأ كـ unverified
    const verifiedStatus = user.verified ?? (isAdminEmail ? true : false);

    await ctx.db.patch(user._id, {
      role: finalRole, 
      status: currentStatus,
      verified: verifiedStatus,
      lastLogin: now,
      updatedAt: now,
    });

    // التحقق مما إذا كان المستخدم قد تم الترحيب به مسبقاً لمنع التكرار
    const alreadyWelcomed = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("title"), "أهلاً بك في MOTORIX! 👋"))
      .first();

    // إرسال إشعارات الترحيب والمراجعة للمستخدمين الجدد فقط (غير الأدمن)
    if (!alreadyWelcomed && user.status === "pending" && !isAdminEmail) {
      // 1. إشعار للأدمن
      await ctx.db.insert("notifications", {
        title: "طلب تفعيل حساب جديد 👤",
        message: `سجل ${user.fullName} حساباً جديداً وهو بانتظار مراجعتك وتفعيلك للمباشرة بالحجز.`,
        type: "system",
        actionType: "APPROVE_USER",
        targetId: user._id,
        priority: "low",
        isRead: false,
        createdAt: now,
      });

      // 2. إشعار ترحيبي للزبون يخبره أن الحساب قيد المراجعة
      await ctx.db.insert("notifications", {
        userId: user._id,
        title: "أهلاً بك في MOTORIX! 👋",
        message: `مرحباً ${user.fullName}، تم إنشاء حسابك بنجاح. حسابك الآن قيد المراجعة، سنقوم بتفعيله قريباً لتتمكن من إتمام حجوزاتك.`,
        type: "reservation",
        priority: "low",
        isRead: false,
        createdAt: now,
      });
    }

    return user._id;
  },
});

/**
 * تفعيل حساب مستخدم (للأدمن فقط)
 */
export const approveUser = mutation({
  args: { token: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await getDbUser(ctx, args.token);
    if (!admin || admin.role !== "admin") throw new Error("غير مصرح لك.");

    // جلب بيانات المستخدم قبل التفعيل للحصول على الإيميل والاسم
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("المستخدم غير موجود.");

    const now = Date.now();
    await ctx.db.patch(args.userId, { status: "active", verified: true, updatedAt: now });

    // إرسال إشعار ترحيبي للزبون بعد التفعيل
    await ctx.db.insert("notifications", {
      userId: args.userId,
      title: "تم تفعيل حسابك بنجاح! 🎉",
      message: "أهلاً بك في MOTORIX. حسابك الآن نشط بالكامل ويمكنك البدء بحجز سياراتك المفضلة.",
      type: "success",
      priority: "high",
      isRead: false,
      createdAt: now,
    });
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
    phone: v.optional(v.string()), // إضافة رقم الهاتف
    address: v.optional(v.string()), // إضافة العنوان
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

/**
 * جلب قائمة جميع المستخدمين (للأدمن فقط)
 * مطلوبة لصفحة UsersPage.tsx
 */
export const listUsers = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const currentUser = await getDbUser(ctx, args.token);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("غير مصرح لك بعرض هذه البيانات.");
    }
    return await ctx.db.query("users").order("desc").collect();
  },
});

/**
 * تحديث رتبة مستخدم (للأدمن فقط)
 * مطلوبة لصفحة UsersPage.tsx
 */
export const updateUserRole = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("sales_manager"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const admin = await getDbUser(ctx, args.token);
    if (!admin || admin.role !== "admin") {
      throw new Error("يجب أن تكون مديراً لتغيير الرتب.");
    }
    
    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });
  },
});

/**
 * حذف مستخدم (للأدمن فقط)
 * مطلوبة لصفحة UsersPage.tsx
 */
export const deleteUser = mutation({
  args: { token: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await getDbUser(ctx, args.token);
    if (!admin || admin.role !== "admin") {
      throw new Error("غير مصرح لك بحذف المستخدمين.");
    }

    if (admin._id === args.userId) {
      throw new Error("لا يمكنك حذف حسابك الخاص من هنا.");
    }

    await ctx.db.delete(args.userId);
  },
});

/**
 * حل نهائي: ترقية حساب admin_motorix@gmail.com إلى مدير نظام بكامل الصلاحيات
 * يضمن هذا التحديث ظهور السايدبار الطويل وفتح كل الأقسام
 * (يجب استدعاء هذه الدالة مرة واحدة من Convex Dashboard أو من متصفحك)
 */
export const fixAdminRole = mutation({
  args: {},
  handler: async (ctx) => {
    const targetEmail = "admin_motorix@gmail.com";
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", targetEmail))
      .unique();

    if (!user) {
      throw new Error("لم يتم العثور على حساب بهذا البريد. يرجى تسجيل الدخول أولاً في الموقع.");
    }

    await ctx.db.patch(user._id, {
      role: "admin",
      status: "active",
      verified: true
    });

    return `تمت الترقية بنجاح لـ ${user.fullName}. السايدبار الطويل سيظهر الآن.`;
  },
});