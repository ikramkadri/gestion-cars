import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./auth"; // Assuming this utility exists

export const listCustomers = query({
  args: { token: v.optional(v.string()), searchTerm: v.optional(v.string()) },
  handler: async (ctx: QueryCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || (user.role !== "admin" && user.role !== "sales_manager")) {
      throw new Error("غير مصرح لك بعرض الزبائن.");
    }

    const customersQuery = ctx.db.query("customers");

    // Fetch all customers first, then filter in memory for complex search terms
    // For better performance with large datasets, consider Convex search indexes for fullName, phone, identityNum
    const allCustomers = await customersQuery.order("desc").collect();

    if (args.searchTerm) {
      const lowerSearchTerm = args.searchTerm.toLowerCase();
      return allCustomers.filter(customer =>
        customer.fullName.toLowerCase().includes(lowerSearchTerm) ||
        customer.phone.includes(lowerSearchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(lowerSearchTerm)) ||
        (customer.identityNum && customer.identityNum.toLowerCase().includes(lowerSearchTerm))
      );
    }

    return allCustomers;
  },
});

export const updateCustomer = mutation({
  args: {
    token: v.string(),
    customerId: v.id("customers"),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    identityNum: v.optional(v.string()),
    status: v.optional(v.string()),
    totalPurchases: v.optional(v.number()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || (user.role !== "admin" && user.role !== "sales_manager")) {
      throw new Error("غير مصرح لك بتعديل الزبائن.");
    }

    const { customerId, ...updates } = args;
    await ctx.db.patch(customerId, {
      ...updates,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activity_logs", { action: "CUSTOMER_UPDATED", details: `تم تحديث بيانات الزبون ${args.fullName || customerId}`, userId: user._id, createdAt: Date.now() });
    return true;
  },
});

export const deleteCustomer = mutation({
  args: { token: v.string(), customerId: v.id("customers") },
  handler: async (ctx: MutationCtx, args) => {
    const user = await getAuthenticatedUser(ctx, args.token);
    if (!user || user.role !== "admin") { // فقط الأدمن يمكنه حذف الزبائن
      throw new Error("غير مصرح لك بحذف الزبائن.");
    }

    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error("الزبون غير موجود.");

    await ctx.db.delete(args.customerId);

    await ctx.db.insert("activity_logs", { action: "CUSTOMER_DELETED", details: `تم حذف الزبون ${customer.fullName}`, userId: user._id, createdAt: Date.now() });
    return true;
  },
});