import { useState, useRef } from 'react';
import { Lock, Save, ShieldCheck, AlertCircle, Camera, Loader2, User, Calendar, Clock, Car, Image as ImageIcon, Store, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from 'react-hot-toast';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/settings/ar.json';
import en from '../lib/i18n/pages/settings/en.json';
import fr from '../lib/i18n/pages/settings/fr.json';

export default function SettingsPage() {
  const token = localStorage.getItem("convex_token") ?? undefined;
  const user = useQuery(api.users.viewer, { token });
  const myBookings = useQuery(api.bookings.getMyBookings, token ? { token } : "skip");
  const settings = useQuery(api.site_settings.getSettings);
  const logoImageUrl = useQuery(api.files.getImageUrl, 
    settings?.logoImageId ? { storageId: settings.logoImageId } : "skip"
  );
  const generateUploadUrl = useMutation(api.cars.generateUploadUrl);
  const updateUser = useMutation(api.users.updateUser);
  const changePassword = useAction(api.users.changePassword);
  const updateSettings = useMutation(api.site_settings.updateSettings);
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
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
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
      await changePassword({ token, currentPassword: passwords.current, newPassword: passwords.new });
      setStatus({ type: 'success', msg: t('password_success') });
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setStatus(null), 5000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('password_error');
      toast.error(msg);
      setStatus({ type: 'error', msg });
      setTimeout(() => setStatus(null), 5000);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, { method: 'POST', body: file });
      const { storageId } = await result.json();
      await updateUser({ token, profileImageId: storageId! });
      toast.success(t('image_updated'));
    } catch {
      toast.error(t('image_error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, { method: 'POST', body: file });
      const { storageId } = await result.json();
      await updateSettings({ token: token!, logoImageId: storageId as any });
      toast.success(t('logo_updated'));
    } catch {
      toast.error(t('logo_error'));
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background space-y-6 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Showroom identity (admin only) */}
      {user?.role === 'admin' && (
        <div className="bg-card rounded-[2.5rem] p-8 shadow-sm border-border mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-600 text-white rounded-2xl">
              <Store size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">{t('section_showroom')}</h2>
              <p className="text-muted-foreground font-medium text-sm">{t('section_showroom_desc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-8 bg-muted/40 p-6 rounded-3xl border border-dashed border-border">
            <div className="relative">
              <div className="w-24 h-24 bg-card rounded-2xl border-2 border-card shadow-md flex items-center justify-center overflow-hidden">
                {logoImageUrl ? (
                  <img src={logoImageUrl} className="w-full h-full object-contain" alt="Logo" />
                ) : (
                  <ImageIcon size={40} className="text-muted-foreground/30" />
                )}
                {isUploadingLogo && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
              </div>
              <button 
                onClick={() => logoInputRef.current?.click()}
                className="absolute -bottom-2 -left-2 min-w-[36px] min-h-[36px] flex items-center justify-center bg-blue-600 text-white rounded-lg shadow-lg hover:scale-110 transition-all"
                aria-label={t('upload_logo') || 'Upload logo'}
              >
                <Camera size={14} />
              </button>
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-card-foreground text-lg">{settings?.showroomName || "MOTORIX"}</h3>
              <p className="text-muted-foreground text-xs font-bold mt-1 uppercase tracking-widest">{t('brand_official')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile */}
      <div className="bg-card rounded-[2.5rem] p-8 shadow-sm border-border mb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-muted overflow-hidden border-4 border-card shadow-xl relative">
            {user?.imageUrl ? (
              <img src={user.imageUrl} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
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
            className="absolute -bottom-2 -left-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
            aria-label={t('upload_photo') || 'Upload photo'}
          >
            <Camera size={20} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
        
        <div className="text-center md:text-right">
          <h2 className="text-2xl font-black text-foreground">{user?.fullName || t('loading')}</h2>
          <p className="text-muted-foreground font-bold">{user?.email}</p>
          <span className="inline-block mt-2 px-4 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
            {user?.role === 'admin' ? t('role_admin') : t('role_employee')}
          </span>
        </div>
      </div>

      {/* My bookings */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
          <Calendar size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">{t('section_bookings')}</h1>
          <p className="text-muted-foreground font-medium text-sm">{t('section_bookings_desc')}</p>
        </div>
      </div>

      <div className="bg-card rounded-[2.5rem] p-8 shadow-sm border-border mb-8">
        {myBookings === undefined ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" size={30} />
          </div>
        ) : myBookings.length === 0 ? (
          <p className="text-center text-muted-foreground font-bold py-10 italic">{t('no_bookings')}</p>
        ) : (
          <div className="space-y-4">
            {myBookings.map((booking) => booking && (
              <div key={booking._id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-muted/40 rounded-3xl border-border hover:shadow-md transition-all gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-16 h-12 bg-card rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                    <Car size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-card-foreground">{booking.carDetails?.make} {booking.carDetails?.model}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1">
                      <Calendar size={14} />
                      <span>{booking.inspectionDate ? new Date(booking.inspectionDate).toLocaleDateString('ar-DZ') : t('not_specified')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                   <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground tabular-nums">
                        {new Date(booking.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                   <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     booking.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                     booking.status === 'pending' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' :
                     'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                   }`}>
                     {booking.status === 'confirmed' ? t('booking_status_confirmed') : 
                      booking.status === 'pending' ? t('booking_status_pending') : 
                      booking.status === 'cancelled' ? t('booking_status_cancelled') : t('booking_status_rejected')}
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

      {/* Security */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">{t('section_security')}</h1>
          <p className="text-muted-foreground font-medium text-sm">{t('section_security_desc')}</p>
        </div>
      </div>

      <div className="bg-card rounded-[2.5rem] p-8 shadow-sm border-border max-w-2xl">
        <h2 className="text-lg font-bold text-card-foreground mb-6 flex items-center gap-2">
          <Lock size={20} className="text-indigo-600" />
          {t('change_password')}
        </h2>

        {status && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
            status.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50' 
              : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50'
          }`}>
            <AlertCircle size={18} />
            {status.msg}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          {/* Current password */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 mr-1">{t('current_password')}</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="w-full bg-muted/50 border-border rounded-2xl px-6 py-4 pl-12 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-right text-foreground"
                placeholder="••••••••"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showPasswords.current ? (t('hide_password') || 'Hide password') : (t('show_password') || 'Show password')}
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New + Confirm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 mr-1">{t('new_password')}</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="w-full bg-muted/50 border-border rounded-2xl px-6 py-4 pl-12 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-right text-foreground"
                  placeholder="••••••••"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPasswords.new ? (t('hide_password') || 'Hide password') : (t('show_password') || 'Show password')}
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwords.new && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map(level => {
                      const hasMix = /[A-Z]/.test(passwords.new) && /[a-z]/.test(passwords.new) && /[0-9]/.test(passwords.new);
                      const score = passwords.new.length >= 10 && hasMix ? 3 : passwords.new.length >= 6 ? 2 : 1;
                      const colors = ['bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
                      return (
                        <div key={level} className={`h-1.5 flex-1 rounded-full transition-all ${level <= score ? colors[score - 1] : 'bg-muted'}`} />
                      );
                    })}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground">
                    {passwords.new.length >= 10 && /[A-Z]/.test(passwords.new) && /[a-z]/.test(passwords.new) && /[0-9]/.test(passwords.new) 
                      ? (t('strength_strong') || 'Strong') 
                      : passwords.new.length >= 6 
                        ? (t('strength_medium') || 'Medium') 
                        : (t('strength_weak') || 'Weak')}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 mr-1">{t('confirm_password')}</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="w-full bg-muted/50 border-border rounded-2xl px-6 py-4 pl-12 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-right text-foreground"
                  placeholder="••••••••"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPasswords.confirm ? (t('hide_password') || 'Hide password') : (t('show_password') || 'Show password')}
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
