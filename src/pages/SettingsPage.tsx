import React, { useState, useRef } from 'react';
import { Lock, Save, ShieldCheck, AlertCircle, Camera, Loader2, User } from 'lucide-react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function SettingsPage() {
  const token = localStorage.getItem("convex_token") ?? undefined;
  
  // جلب بيانات المستخدم الحالي
  const user = useQuery(api.users.viewer, { token });
  
  // Mutations
  const generateUploadUrl = useMutation(api.cars.generateUploadUrl);
  const updateUser = useMutation(api.users.updateUser);
  const changePassword = useAction(api.users.changePassword); // تغيير useMutation إلى useAction

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    
    if (passwords.new !== passwords.confirm) {
      setStatus({ type: 'error', msg: 'كلمة المرور الجديدة غير متطابقة' });
      return;
    }

    if (!token) {
      setStatus({ type: 'error', msg: 'كلمة المرور الجديدة غير متطابقة' });
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword({
        token,
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      
      setStatus({ type: 'success', msg: 'تم تحديث كلمة المرور بنجاح!' });
      setPasswords({ current: '', new: '', confirm: '' }); // تنظيف الحقول
    } catch (err: unknown) {
      const error = err as Error;
      const msg = error.message || 'فشل تحديث كلمة المرور';
      setStatus({ type: 'error', msg });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus(null);

    try {
      // 1. الحصول على رابط الرفع المؤقت
      const postUrl = await generateUploadUrl({ token });
      
      // 2. رفع الملف إلى Convex Storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("فشل الرفع للسيرفر");
      
      const { storageId } = await result.json();

      // 3. تحديث سجل المستخدم وربطه بالـ storageId الجديد
      await updateUser({ 
        token,
        fullName: user?.fullName, 
        profileImageId: storageId // تأكد أن الباك إند يستقبل هذا الحقل ويحدث الـ imageId
      });

      setStatus({ type: 'success', msg: 'تم تحديث الصورة الشخصية بنجاح' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', msg: 'فشل رفع الصورة' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* قسم البروفايل */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl relative">
            {user?.imageUrl ? (
              <img src={user.imageUrl} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <User size={60} />
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="text-white animate-spin" size={30} />
              </div>
            )}
          </div>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute -bottom-2 -left-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <Camera size={20} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
        
        <div className="text-center md:text-right">
          <h2 className="text-2xl font-black text-slate-900">{user?.fullName || 'تحميل...'}</h2>
          <p className="text-slate-500 font-bold">{user?.email}</p>
          <span className="inline-block mt-2 px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            {user?.role === 'admin' ? 'مدير النظام' : 'موظف'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">إعدادات الأمان</h1>
          <p className="text-slate-500 font-medium text-sm">إدارة كلمة المرور وحماية حسابك</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 max-w-2xl">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Lock size={20} className="text-indigo-600" />
          تغيير كلمة المرور
        </h2>

        {status && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            <AlertCircle size={18} />
            {status.msg}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mr-1">كلمة المرور الحالية</label>
            <input
              type="password"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-right"
              placeholder="••••••••"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mr-1">كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-right"
                placeholder="••••••••"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 mr-1">تأكيد الكلمة الجديدة</label>
              <input
                type="password"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-right"
                placeholder="••••••••"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
            >
              {isSavingPassword ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              تحديث كلمة المرور
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}