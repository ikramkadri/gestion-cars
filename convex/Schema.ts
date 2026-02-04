import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cars: defineTable({
    model: v.string(),
    price: v.number(),
    status: v.string(),
  }),
});