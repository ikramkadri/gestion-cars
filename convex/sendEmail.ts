"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { Resend } from "resend";

/** تعريف يدوي لمتغيرات البيئة لتجنب أخطاء TypeScript في بيئة Node */
declare const process: {
  env: {
    RESEND_API_KEY?: string;
    [key: string]: string | undefined;
  };
};

/**
 * دالة إرسال بريد إلكتروني ترحيبي للزبون الجديد
 * يتم استدعاؤها عادةً من الواجهة الأمامية بعد نجاح عملية التسجيل
 */
export const sendWelcomeEmail = action({
  args: {
    toEmail: v.string(),
    customerName: v.string(),
  },
  handler: async (ctx, args) => {
    const resendKey = process.env.RESEND_API_KEY;
    
    if (!resendKey) {
      console.error("RESEND_API_KEY is missing in environment variables");
      throw new Error("إعدادات البريد الإلكتروني غير مكتملة.");
    }

    const resend = new Resend(resendKey);

    try {
      await resend.emails.send({
        from: "Motorix <onboarding@resend.dev>",
        to: args.toEmail,
        subject: "Bienvenue chez Motorix 🚗",
        html: `
          <div dir="rtl" style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
            <h1 style="color: #2563eb; text-align: center;">مرحباً بك في Motorix، ${args.customerName}! 🚗</h1>
            <p style="font-size: 16px; color: #444; line-height: 1.6;">تم إنشاء حسابك بنجاح في منصتنا المتطورة لإدارة وبيع السيارات.</p>
            <p style="font-size: 14px; color: #666; line-height: 1.5;">نحن سعداء جداً بانضمامك إلى عائلة موتوريكس. يمكنك الآن البدء باستكشاف أحدث السيارات المتوفرة وحجز مواعيد المعاينة مباشرة عبر الموقع.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://motorix-showroom.vercel.app" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">تصفح المخزن الآن</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #999; text-align: center;">هذا بريد تلقائي، يرجى عدم الرد عليه. <br/> © ${new Date().getFullYear()} Motorix Global Standard System.</p>
          </div>
        `,
      });
      return { success: true };
    } catch (error) {
      console.error("Error sending welcome email via Resend:", error);
      throw new Error("فشل إرسال بريد الترحيب.");
    }
  },
});

/**
 * إرسال بريد إلكتروني عند تحديث حالة الحجز (قبول أو رفض)
 */
export const sendBookingStatusEmail = action({
  args: {
    toEmail: v.string(),
    customerName: v.string(),
    carName: v.string(),
    status: v.union(v.literal("confirmed"), v.literal("rejected")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const isConfirmed = args.status === "confirmed";

    await resend.emails.send({
      from: "Motorix <reservations@resend.dev>",
      to: args.toEmail,
      subject: isConfirmed ? "تم تأكيد موعد المعاينة ✅" : "تحديث بخصوص طلب الحجز ⚠️",
      html: `
        <div dir="rtl" style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
          <h2 style="color: ${isConfirmed ? '#10b981' : '#f43f5e'}; text-align: center;">
            ${isConfirmed ? 'أهلاً بك، تم قبول طلبك!' : 'نعتذر منك، تم رفض الطلب'}
          </h2>
          <p>عزيزي <b>${args.customerName}</b>، بخصوص طلب حجز سيارة <b>${args.carName}</b>:</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            ${isConfirmed 
              ? 'تم تأكيد موعدك بنجاح. فريقنا بانتظارك في المعرض لإتمام المعاينة.' 
              : `للأسف تعذر قبول الطلب. السبب: ${args.reason || 'السيارة لم تعد متوفرة'}`}
          </div>
          <p style="font-size: 12px; color: #999;">شكراً لاختيارك Motorix.</p>
        </div>
      `,
    });
  },
});

/**
 * إرسال تأكيد البيع النهائي مع تفاصيل الفاتورة
 */
export const sendSaleConfirmationEmail = action({
  args: {
    toEmail: v.string(),
    customerName: v.string(),
    carName: v.string(),
    invoiceNumber: v.string(),
    amountPaid: v.number(),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Motorix <sales@resend.dev>",
      to: args.toEmail,
      subject: `مبروك! تم تأكيد شراء ${args.carName} 🎉`,
      html: `
        <div dir="rtl" style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 50px;">🎊</span>
          </div>
          <h2 style="color: #4f46e5; text-align: center;">مبارك لك سيارتك الجديدة!</h2>
          <p>أهلاً <b>${args.customerName}</b>، تم إتمام عملية البيع بنجاح.</p>
          
          <div style="border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h4 style="margin-top: 0;">ملخص العملية:</h4>
            <table style="width: 100%; font-size: 14px;">
              <tr><td>المركبة:</td><td style="text-align: left;"><b>${args.carName}</b></td></tr>
              <tr><td>رقم الفاتورة:</td><td style="text-align: left;"><code>${args.invoiceNumber}</code></td></tr>
              <tr><td>المبلغ المدفوع:</td><td style="text-align: left; color: #059669;"><b>${args.amountPaid.toLocaleString()} دج</b></td></tr>
            </table>
          </div>

          <p>يمكنك تحميل فاتورتك والاطلاع على تفاصيل الضمان عبر تسجيل الدخول إلى حسابك في الموقع.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://motorix-showroom.vercel.app/admin/orders" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">مشاهدة فواتيري</a>
          </div>
          
          <p style="font-size: 11px; color: #94a3b8; margin-top: 40px; text-align: center;">يسعدنا دائماً خدمتك في Motorix - قيادة المستقبل تبدأ من هنا.</p>
        </div>
      `,
    });
  },
});