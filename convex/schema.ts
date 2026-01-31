


import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    role: v.string(), // admin | employe | client
  }),

  cars: defineTable({
    marque: v.string(),
    modele: v.string(),
    annee: v.number(),
    prix: v.number(),
    disponible: v.boolean(),
  }),
});
