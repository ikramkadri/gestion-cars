import React, { useState } from 'react';
import { useAuth } from "@convex-dev/auth/react";  // ✅ هذا هو المصدر الصحيح
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, Loader2, Facebook, Github, Chrome } from 'lucide-react'; // ✅ أشيلنا Car

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    if (!isLogin && !formData.name) {
      newErrors.name = 'الاسم مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn('password', { email: formData.email, password: formData.password });
        navigate('/admin/cars');
      } else {
        await signUp('password', { 
          email: formData.email, 
          password: formData.password,
          name: formData.name 
        });
        navigate('/admin/cars');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ email: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4" dir="rtl">
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Zap size={22} className="text-white" fill="currentColor" />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tighter">MOTORIX</span>
              <span className="block text-[8px] text-blue-300 font-bold tracking-[0.2em] uppercase">Elite Drive</span>
            </div>
          </div>
          <p className="text-slate-300 text-sm mt-4">
            {isLogin ? 'مرحباً بك في منصة MOTORIX' : 'أنشئ حسابك الجديد'}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          
          <div className="flex gap-2 bg-white/5 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">الاسم الكامل</label>
                <div className="relative">
                  <UserPlus className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="أحمد محمد"
                    className={`w-full bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-2xl pr-12 pl-4 py-4 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@motorix.com"
                  className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-2xl pr-12 pl-4 py-4 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-2xl pr-12 pl-12 py-4 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-all"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-[10px] mt-1">{errors.password}</p>}
            </div>

            {isLogin && (
              <div className="text-left">
                <button type="button" className="text-[10px] font-black text-blue-400 hover:text-blue-300 transition-all uppercase tracking-wider">
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white/5 backdrop-blur px-4 py-1 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-wider">أو</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 transition-all group">
              <Chrome size={18} className="text-slate-400 group-hover:text-white transition-colors" />
            </button>
            <button onClick={() => handleSocialLogin('github')} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 transition-all group">
              <Github size={18} className="text-slate-400 group-hover:text-white transition-colors" />
            </button>
            <button onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 transition-all group">
              <Facebook size={18} className="text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        <p className="text-center text-[9px] text-slate-400 mt-8">
          بالتسجيل، أنت توافق على{' '}
          <button className="text-blue-400 hover:text-blue-300 transition-all">شروط الاستخدام</button>
          {' و '}
          <button className="text-blue-400 hover:text-blue-300 transition-all">سياسة الخصوصية</button>
        </p>
      </div>
    </div>
  );
}