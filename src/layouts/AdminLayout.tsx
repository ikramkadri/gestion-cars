import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { toast } from 'react-hot-toast';
import { api } from '../../convex/_generated/api';
import { Loader2, LogOut, LayoutDashboard, Car, Settings, Package } from 'lucide-react';

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("convex_token") ?? undefined;
  const user = useQuery(api.users.viewer, token ? { token } : "skip"); // Pass token only if it exists, otherwise skip
  const customSignOut = useMutation(api.auth.signOut);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-blue-500">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const handleSignOut = async () => {
    if (token) await customSignOut({ token });
    localStorage.removeItem("convex_token");
    toast.success("تم تسجيل الخروج بنجاح!");
    window.location.href = "/";
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FD]" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl p-6 flex flex-col justify-between border-l border-slate-100">
        <div>
          <div className="flex items-center gap-2 px-2 mb-10">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Car size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">MOTORIX</h1>
          </div>
          
          <nav className="space-y-2">
            <button onClick={() => navigate("/admin")} className="flex items-center gap-3 w-full p-3 rounded-2xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-bold">
              <LayoutDashboard size={20} /> لوحة القيادة
            </button>
            <button onClick={() => navigate("/admin/inventory")} className="flex items-center gap-3 w-full p-3 rounded-2xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-bold">
              <Package size={20} /> المخزون
            </button>
            <button onClick={() => navigate("/admin/settings")} className="flex items-center gap-3 w-full p-3 rounded-2xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-bold">
              <Settings size={20} /> الإعدادات
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100">
          {user && (
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm overflow-hidden">
                <img 
                  src={user.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName || 'User'}`} 
                  alt="profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 leading-none">{user.fullName || "مستخدم جديد"}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{user.role || "viewer"}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full p-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all font-black text-sm"
          >
            <LogOut size={18} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;