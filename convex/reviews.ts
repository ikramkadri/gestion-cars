import { v } from "convex/values";
import { mutation, query, internalMutation, MutationCtx, QueryCtx } from "./_generated/server";
import { getAuthenticatedUser } from "./auth";
import { Doc } from "./_generated/dataModel";

/**
 * إضافة تقييم جديد من قبل الزبون (للمشتريات المؤكدة فقط)
 */
export const addReview = mutation({
  args: {
    token: v.string(),
    carId: v.id("cars"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user) throw new Error("يجب تسجيل الدخول لإضافة تقييم");

    // التحقق من أن الزبون اشترى السيارة فعلياً لضمان مصداقية التقييم
    const sale = await ctx.db
      .query("sales")
      .filter((q) => q.and(
        q.eq(q.field("userId"), user._id),
        q.eq(q.field("carId"), args.carId)
      ))
      .first();

    if (!sale) throw new Error("يمكنك تقييم السيارات التي قمت بشرائها فقط.");

    const now = Date.now();
    return await ctx.db.insert("reviews", {
      userId: user._id,
      userName: user.fullName,
      carId: args.carId,
      rating: args.rating,
      comment: args.comment,
      status: "approved", // يمكن تغييرها لـ pending للمراجعة الإدارية
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * جلب أحدث التقييمات الإيجابية لعرضها في الصفحة الرئيسية
 */
export const getLatestReviews = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(6);
  },
});

/**
 * دالة داخلية لأرشفة التقييمات القديمة (أكثر من 180 يوماً)
 * تُستدعى بواسطة Cron Job
 */
export const archiveOldReviews = internalMutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const oneHundredEightyDaysAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
    const oldReviews = await ctx.db
      .query("reviews")
      .withIndex("by_createdAt", (q) => q.lt("createdAt", oneHundredEightyDaysAgo))
      .collect();

    for (const review of oldReviews) await ctx.db.patch(review._id, { status: "archived", updatedAt: Date.now() });
    console.log(`[Cleanup] Archived ${oldReviews.length} old reviews.`);
  },
});

/**
 * جلب جميع التقييمات مع إمكانية التصفية (للأدمن)
 */
export const getAllReviews = query({
  args: { 
    token: v.string(), 
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("archived"))),
    carId: v.optional(v.id("cars")),
    searchTerm: v.optional(v.string()), // للبحث في محتوى التقييم أو اسم المستخدم
  },
  handler: async (ctx: QueryCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") {
      throw new Error("غير مصرح لك بعرض التقييمات.");
    }

    let reviewsQuery;
    
    // تحسين الأداء باستخدام الفهارس (Indexes)
    if (args.status) {
      reviewsQuery = ctx.db.query("reviews").withIndex("by_status", (q) => q.eq("status", args.status!));
    } else if (args.carId) {
      reviewsQuery = ctx.db.query("reviews").withIndex("by_car", (q) => q.eq("carId", args.carId!));
    } else {
      reviewsQuery = ctx.db.query("reviews");
    }

    let reviews = await reviewsQuery.order("desc").collect();

    // تصفية إضافية حسب البحث إذا كان موجوداً
    if (args.searchTerm) {
      const lowerSearchTerm = args.searchTerm.toLowerCase();
      reviews = reviews.filter(r => 
        r.comment.toLowerCase().includes(lowerSearchTerm) ||
        r.userName.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return await Promise.all(reviews.map(async (review) => {
      const car = await ctx.db.get(review.carId);
      return {
        ...review,
        carName: car ? `${car.make} ${car.model}` : "سيارة محذوفة",
      };
    }));
  },
});

/**
 * تحديث حالة التقييم (موافقة، رفض، أرشفة) للأدمن
 */
export const updateReviewStatus = mutation({
  args: { 
    token: v.string(), 
    reviewId: v.id("reviews"), 
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("archived")) 
  },
  handler: async (ctx: MutationCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") {
      throw new Error("غير مصرح لك بتغيير حالة التقييم.");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("التقييم غير موجود.");

    await ctx.db.patch(args.reviewId, { 
      status: args.status, 
      updatedAt: Date.now() 
    });
  },
});