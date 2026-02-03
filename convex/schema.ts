import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. جدول السيارات - (تستخدمه صاحبة الـ Inventory)
  vehicles: defineTable({
    marque: v.string(),          // الماركة
    modele: v.string(),          // الموديل
    annee: v.number(),           // السنة
    prix: v.number(),            // السعر
    kilometrage: v.number(),     // الكيلومتراج
    etat: v.string(),            // الحالة (Neuve / Occasion)
    statut: v.string(),          // الوضعية (Disponible / Réservée / Vendue)
  }),

  // 2. جدول الزبائن - (تستخدمه صاحبة الـ Sales)
  clients: defineTable({
    nomComplet: v.string(),
    telephone: v.string(),       // وسيلة التواصل الأساسية
    email: v.optional(v.string()), // وسيلة التواصل للاحترافية والـ Confirmation
    adresse: v.optional(v.string()),
  }),

  // 3. جدول الطلبيات والحجز (COMMANDE/Réservation) - (تستخدمه صاحبة الـ Sales)
  orders: defineTable({
    clientId: v.id("clients"),
    vehicleId: v.id("vehicles"),
    type: v.string(),            // نوع العملية (Vente / Réservation)
    date_cmd: v.string(),
    statut: v.string(),          // حالة الطلب (En attente / Validée / Annulée)
    montantTotal: v.number(),
  }),

  // 4. جدول المدفوعات (PAIEMENT) - (تستخدمه صاحبة الـ Sales)
  payments: defineTable({
    orderId: v.id("orders"),     // ربط الدفع بالطلبية
    date_pmnt: v.string(),
    montant: v.number(),
    mode_pmnt: v.string(),       // طريقة الدفع (Espèce / Virement / Chèque)
  }),

  // 5. جدول التواصل (CONTACT) - (تستخدمينه أنتِ كـ Admin لاستقبال رسائل الزوار)
  messages: defineTable({
    nom: v.string(),
    email: v.string(),
    sujet: v.string(),
    contenu: v.string(),
    dateEnvoi: v.string(),
    lu: v.boolean(),             // هل قرأ الآدمن الرسالة أم لا
  }),

  // 6. جدول المستخدمين - (تستخدمينه أنتِ للتحكم في النظام)
  users: defineTable({
    nom: v.string(),
    email: v.string(),
    role: v.string(),            // (admin / employee)
    tokenIdentifier: v.string(), // معرف الحماية
  }),
});