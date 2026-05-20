import { useState } from "react";
import { useAction } from "convex/react"; // تغيير useMutation إلى useAction
import { api } from "../../convex/_generated/api";
import { Mail, Lock, Loader2, ArrowLeft, Zap, User, X } from "lucide-react"; // ArrowLeft أفضل للـ RTL
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  // تعريف الـ Mutations لعمليتي الدخول والتسجيل
  const authenticate = useAction(api.auth.authenticate); // استخدام دالة authenticate الجديدة كـ action
  const location = useLocation();
  
  const navigate = useNavigate();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const authAction = authenticate; // دائما نستخدم authenticate
      const result = await authAction({ 
        email, 
        name: flow === "signUp" ? fullName : email.split('@')[0],
        password: password 
      });
      
      if (result?.token) {
        localStorage.setItem("convex_token", result.token);
        toast.success(flow === "signIn" ? "تم تسجيل الدخول بنجاح!" : "تم إنشاء الحساب! يرجى مراجعة بريدك لتأكيده.");
        
        // العودة للصفحة السابقة إذا وجدت، أو الذهاب للوحة التحكم افتراضياً
        const from = location.state?.from || "/admin";
        navigate(from, { state: location.state, replace: true });
      }
    } catch (err: unknown) {
      console.error(err);
      // معالجة الخطأ بشكل أفضل
      const error = err as Error;
      const msg = error.message || "";
      if (msg.includes("password")) {
        toast.error("كلمة المرور غير صحيحة أو ضعيفة");
      } else if (msg.includes("already exists")) {
        toast.error("هذا البريد الإلكتروني مسجل بالفعل");
      } else {
        toast.error("حدث خطأ في البيانات، يرجى المحاولة مرة أخرى");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        {/* زر الإغلاق للعودة للموقع */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-900 transition-colors z-10"
        >
          <X size={24} />
        </button>
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-indigo-600 rounded-3xl text-white mb-4 shadow-xl shadow-indigo-200">
            <Zap size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">MOTORIX</h1>
          <p className="text-slate-500 font-bold mt-2">
            {flow === "signIn" ? "مرحباً بك مجدداً!" : "أنشئ حسابك للبدء"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {flow === "signUp" && (
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-12 pl-4 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-right"
                  placeholder="الاسم واللقب"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-12 pl-4 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-right"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-12 pl-4 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-right"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <span>{flow === "signIn" ? "دخول" : "إنشاء حساب"}</span>
                <ArrowLeft size={20} /> 
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-slate-500 font-bold">
            {flow === "signIn" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
            <button
              onClick={() => {
                setFlow(flow === "signIn" ? "signUp" : "signIn");
                // لا حاجة لمسح الخطأ يدوياً، الـ toast سيختفي
              }}
              className="text-indigo-600 mr-2 hover:underline underline-offset-4"
            >
              {flow === "signIn" ? "سجل الآن" : "سجل دخولك"}
            </button>
          </p>
        </div>
      </div>

      <div className="fixed bottom-6 text-slate-700 font-black text-sm tracking-widest opacity-20">
        MOTORIX AUTHENTICATION SYSTEM v2.0
      </div>
    </div>
  );
}