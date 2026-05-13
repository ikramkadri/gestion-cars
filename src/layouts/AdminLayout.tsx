import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { toast } from 'react-hot-toast';
import { api } from '../../convex/_generated/api';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '../components/LoadingScreen';
import { Menu, X } from 'lucide-react';

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem("convex_token") ?? undefined;
  const user = useQuery(api.users.viewer, token ? { token } : "skip"); // Pass token only if it exists, otherwise skip
  const customSignOut = useMutation(api.auth.signOut);

  if (user === undefined) {
    return <LoadingScreen />;
  }

  const handleSignOut = async () => {
    if (token) await customSignOut({ token });
    localStorage.removeItem("convex_token");
    toast.success("تم تسجيل الخروج بنجاح!");
    window.location.href = "/";
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] relative" dir="rtl">
      {/* زر القائمة للهواتف */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-[110] p-3 bg-white rounded-2xl shadow-lg text-indigo-600"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay للهواتف */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[90]" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 right-0 z-[100] transform transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          user={user} 
          onSignOut={handleSignOut} 
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:pr-8 overflow-y-auto w-full">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;