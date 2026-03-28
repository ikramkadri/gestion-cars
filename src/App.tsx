import React, { useState } from 'react';
import { Car, Lock, User, AlertCircle, Loader2, Users } from 'lucide-react';

/**
 * تحديث بناءً على ملفات الباك آند (Convex) التي قدمتها:
 * - النظام يدعم أدوار: admin, customer, guest (كما في schema.ts).
 * - التوثيق (Auth) يتم عبر Clerk (كما في cars.ts).
 * - يدعم العمليات: Inventory, Sales, Statistics.
 */

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // دالة تسجيل الدخول (سيتم ربطها بـ Clerk و Convex Mutations)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // محاكاة الاتصال بنظام Convex Auth
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // منطق تجريبي للمعاينة:
      if (email === "admin@car.com" && password === "123456") {
        console.log("تم الدخول بصلاحية: Admin - الوصول لجميع الجداول متاح");
      } else {
        // رسالة خطأ تعكس الموجود في ملفات الباك آند
        setError("بيانات الدخول غير صحيحة أو المستخدم غير موجود في سجلات النظام (users table).");
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بـ Convex Server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans selection:bg-blue-100" dir="rtl">
      
      {/* قسم التقديم الخاص بمشروع التخرج (الميموار) */}
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-lg mb-1">
          <Users size={20} />
          <span>مشروع تخرج: نظام إدارة معرض السيارات الرقمي</span>
        </div>
        <p className="text-slate-500 text-sm italic">إعداد فريق العمل: (3 طالبات) - دفعة 2024/2025</p>
      </div>

      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-200 p-10 space-y-6 relative overflow-hidden">
        
        {/* شريط زخرفي علوي يعبر عن علامة تجارية احترافية */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500"></div>

        {/* القسم العلوي: الشعار */}
        <div className="flex flex-col items-center space-y-3">
          <div className="p-4 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/20 transform transition-transform hover:scale-110 duration-300">
            <Car className="text-white" size={36} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">تسجيل الدخول</h1>
            <p className="text-sm text-slate-500 mt-1">
              لوحة تحكم النظام (Auto Manager)
            </p>
          </div>
        </div>

        {/* تنبيه الخطأ مستوحى من تصميم shadcn/ui */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3 animate-in zoom-in-95">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="text-xs font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 pr-1">البريد الإلكتروني</label>
            <div className="relative group">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="email"
                required
                className="flex h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-11 pl-4 py-2 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                placeholder="name@auto-expo.dz"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between pr-1">
              <label className="text-sm font-bold text-slate-700">كلمة المرور</label>
            </div>
            <div className="relative group">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="password"
                required
                className="flex h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pr-11 pl-4 py-2 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="relative flex items-center justify-center w-full h-12 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-[0.97] disabled:opacity-70 disabled:pointer-events-none"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>جاري المزامنة مع Convex...</span>
              </div>
            ) : (
              'دخول لوحة التحكم'
            )}
          </button>
        </form>

        {/* فاصل بصري */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400"><span className="bg-white px-3">Secure Auth Layer</span></div>
        </div>

        {/* ملخص تقني للميموار - يوضح أن النظام متكامل */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
          <p className="text-[10px] text-blue-700 leading-relaxed text-center font-medium">
            النظام يدعم حالياً: 
            <span className="mx-1 px-1.5 py-0.5 bg-white rounded border border-blue-200 uppercase">Inventory</span> 
            <span className="mx-1 px-1.5 py-0.5 bg-white rounded border border-blue-200 uppercase">Sales Tracking</span> 
            <span className="mx-1 px-1.5 py-0.5 bg-white rounded border border-blue-200 uppercase">Invoicing PDF</span>
          </p>
        </div>
      </div>

      {/* Footer المعلوماتي */}
      <footer className="mt-10 text-slate-400 text-[10px] font-bold tracking-widest uppercase">
        © {new Date().getFullYear()} Auto Manager System | Grad Project v1.0
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <div className="app-main">
      <LoginPage />
    </div>
  );
}