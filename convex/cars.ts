import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/* ===== QUERY ===== */
export const getCars = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cars").collect();
  },
});

/* ===== MUTATION ===== */
export const addCar = mutation({
  args: {
    marque: v.string(),
    modele: v.string(),
    annee: v.number(),
    prix: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("cars", {
      ...args,
      disponible: true,
    });
  },
});
