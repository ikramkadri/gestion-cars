import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { toast } from 'react-hot-toast';
import { api } from '../../convex/_generated/api';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '../components/LoadingScreen';
import { Menu, X } from 'lucide-react';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/admin-layout/ar.json';
import en from '../lib/i18n/pages/admin-layout/en.json';
import fr from '../lib/i18n/pages/admin-layout/fr.json';
const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t, isRtl } = usePageTranslation({ ar, en, fr });
  const token = localStorage.getItem("convex_token") ?? undefined;
  const user = useQuery(api.users.viewer, token ? { token } : "skip");
  const customSignOut = useMutation(api.auth.signOut);

  if (user === undefined) {
    return <LoadingScreen />;
  }

  const handleSignOut = async () => {
    if (token) await customSignOut({ token });
    localStorage.removeItem("convex_token");
    toast.success(t('sign_out_success'));
    window.location.href = "/";
  }

  return (
    <div className="flex min-h-screen bg-background relative transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`lg:hidden fixed top-4 ${isRtl ? 'right-4' : 'left-4'} z-[110] p-3 bg-card rounded-2xl shadow-lg text-indigo-600 border border-border`}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[90]" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 ${isRtl ? 'right-0' : 'left-0'} z-[100] transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          user={user ? { ...user, imageUrl: user.imageUrl ?? undefined } : user} 
          onSignOut={handleSignOut} 
        />
      </div>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
