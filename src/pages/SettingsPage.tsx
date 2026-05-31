import { useState, useRef } from 'react';
import { Lock, Save, ShieldCheck, AlertCircle, Camera, Loader2, User, Calendar, Clock, Car, Image as ImageIcon, Store } from 'lucide-react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from 'react-hot-toast'; // Import toast
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/settings/ar.json';
import en from '../lib/i18n/pages/settings/en.json';
import fr from '../lib/i18n/pages/settings/fr.json';

export default function SettingsPage() {
  const token = localStorage.getItem("convex_token") ?? undefined;
  
  // جلب بيانات المستخدم الحالي
  const user = useQuery(api.users.viewer, { token });
  
  // جلب حجوزات المستخدم
  const myBookings = useQuery(api.bookings.getMyBookings, token ? { token } : "skip");

  // إعدادات الموقع
  const settings = useQuery(api.site_settings.getSettings);

  // جلب رابط اللوغو بشكل صحيح (قاعدة: لا تضع useQuery داخل الـ return)
  const logoImageUrl = useQuery(api.files.getImageUrl, 
    settings?.logoImageId ? { storageId: settings.logoImageId } : "skip"
  );

  // Mutations
  const generateUploadUrl = useMutation(api.cars.generateUploadUrl); // Corrected path to api.cars
  const updateUser = useMutation(api.users.updateUser);
  const changePassword = useAction(api.users.changePassword); // تغيير useMutation إلى useAction
  const updateSettings = useMutation(api.site_settings.updateSettings); // No longer needs 'as any' after creating convex/site_settings.ts

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const { t } = usePageTranslation({ ar, en, fr });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    
    if (passwords.new !== passwords.confirm) {
      toast.error(t('password_mismatch'));
      return;
    }

    if (!token) {
      toast.error(t('password_no_token'));
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword({
        token,
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      
      setStatus({ type: 'success', msg: t('password_success') });
      setPasswords({ current: '', new: '', confirm: '' }); // Clear fields
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('password_error');
      toast.error(msg);
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
      const postUrl = await generateUploadUrl();
      
      // 2. رفع الملف إلى Convex Storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error(t('upload_error'));
      
      const { storageId } = await result.json();

      // 3. تحديث سجل المستخدم وربطه بالـ storageId الجديد
      await updateUser({ 
        token,
        fullName: user?.fullName, 
        profileImageId: storageId // تأكد أن الباك إند يستقبل هذا الحقل ويحدث الـ imageId
      });

      setStatus({ type: 'success', msg: t('profile_update_success') });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', msg: t('profile_upload_error') });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await updateSettings({ 
        token: token || "",
        logoImageId: storageId 
      });

      toast.success(t('logo_update_success'));
    } catch {
      toast.error(t('logo_upload_error'));
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#F8F9FD] dark:bg-slate-950 space-y-6 animate-in fade-in duration-500 text-right" dir="rtl">
      
      {/* قسم هوية المعرض (للأدمن فقط) */}
      {user?.role === 'admin' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-600 text-white rounded-2xl">
              <Store size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('section_showroom')}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('section_showroom_desc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <div className="relative">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl border-2 border-white dark:border-slate-700 shadow-md flex items-center justify-center overflow-hidden">
                {logoImageUrl ? (
                  <img src={logoImageUrl} className="w-full h-full object-contain" alt="Logo" />
                ) : (
                  <ImageIcon size={40} className="text-slate-200 dark:text-slate-700" />
                )}
                {isUploadingLogo && <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
              </div>
              <button 
                onClick={() => logoInputRef.current?.click()}
                className="absolute -bottom-2 -left-2 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:scale-110 transition-all"
              >
                <Camera size={14} />
              </button>
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg">{settings?.showroomName || "MOTORIX"}</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">{t('brand_official')}</p>
            </div>
          </div>
        </div>
      )}

      {/* قسم البروفايل */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl relative">
            {user?.imageUrl ? (
              <img src={user.imageUrl} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user?.fullName || t('loading')}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold">{user?.email}</p>
          <span className="inline-block mt-2 px-4 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
            {user?.role === 'admin' ? t('role_admin') : t('role_employee')}
          </span>
        </div>
      </div>

      {/* قسم حجوزاتي */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
          <Calendar size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t('section_bookings')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('section_bookings_desc')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
        {myBookings === undefined ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" size={30} />
          </div>
        ) : myBookings.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 font-bold py-10 italic">{t('no_bookings')}</p>
        ) : (
          <div className="space-y-4">
            {myBookings.map((booking) => booking && (
              <div key={booking._id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-16 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                    <Car size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">{booking.carDetails?.make} {booking.carDetails?.model}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">
                      <Calendar size={14} />
                      <span>{booking.inspectionDate ? new Date(booking.inspectionDate).toLocaleDateString('ar-DZ') : t('not_specified')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                   <div className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-400 dark:text-slate-500" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                        {new Date(booking.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     booking.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                     booking.status === 'pending' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' :
                     'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                   }`}>
                     {booking.status === 'confirmed' ? t('booking_status_confirmed') : booking.status === 'pending' ? t('booking_status_pending') : booking.status === 'cancelled' ? t('booking_status_cancelled') : t('booking_status_rejected')}
                   </span>
                </div>
                {booking.status === 'rejected' && booking.rejectionReason && (
                  <div className="w-full md:w-auto mt-4 md:mt-0 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-bold text-right">
                    <p className="font-black mb-1">{t('rejection_reason')}</p>
                    <p>{booking.rejectionReason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t('section_security')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('section_security_desc')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 max-w-2xl">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
          <Lock size={20} className="text-indigo-600" />
          {t('change_password')}
        </h2>

        {status && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50' : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50'}`}>
            <AlertCircle size={18} />
            {status.msg}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mr-1">{t('current_password')}</label>
            <input
              type="password"
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-right dark:text-white"
              placeholder="••••••••"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mr-1">{t('new_password')}</label>
              <input
                type="password"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-right dark:text-white"
                placeholder="••••••••"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mr-1">{t('confirm_password')}</label>
              <input
                type="password"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-right dark:text-white"
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
              {t('update_password')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}