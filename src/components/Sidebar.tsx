import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Car, Settings, LogOut, 
  Users, BookOpen, FileText, BarChart3,
  ShoppingCart,
  ChevronRight, ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  user?: any;
  onSignOut?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onSignOut }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'inventory', label: 'المخزون', icon: Car, color: 'text-emerald-500' },
    { id: 'customers', label: 'الزبائن', icon: Users, color: 'text-violet-500' },
    ...(user?.role === 'admin' || user?.role === 'sales_manager' ? [
      { id: 'sales', label: 'المبيعات', icon: ShoppingCart, color: 'text-amber-500' },
      { id: 'statistics', label: 'الإحصائيات', icon: BarChart3, color: 'text-rose-500' },
      { id: 'invoices', label: 'الفواتير', icon: FileText, color: 'text-pink-500' },
    ] : []),
    { id: 'bookings', label: 'الحجوزات', icon: BookOpen, color: 'text-sky-500' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, color: 'text-slate-400' },
  ].filter(Boolean);

  return (
    <aside 
      className={`sticky top-0 h-screen ${isCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-4 flex flex-col shadow-xl z-[100] border-l border-slate-100 dark:border-white/5 transition-all duration-300 ease-in-out`} 
      dir="rtl"
    >
      {/* زر الطي (Toggle Button) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-20 bg-indigo-600 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-[110]"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-10 px-2 py-4 border-b border-slate-50 dark:border-white/5 overflow-hidden`}>
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
          <Car size={24} className="text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col text-right animate-in fade-in duration-300">
            <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">MOTORIX</h1>
            <span className="text-[10px] text-indigo-500 dark:text-blue-400 font-bold uppercase tracking-[0.2em]">Management</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.id === 'dashboard' ? '/admin' : `/admin/${item.id}`}
            end={item.id === 'dashboard'}
            className={({ isActive }) => `w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-3.5 rounded-2xl transition-all duration-300 group ${
              isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} className={isActive ? 'text-white' : `${item.color} group-hover:scale-110 transition-all`} />
                {!isCollapsed && (
                  <span className="font-bold text-sm tracking-wide animate-in fade-in duration-300">{item.label}</span>
                )}
                {isActive && !isCollapsed && <div className="mr-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
        {user && (
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-6 px-2`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-blue-600/20 border border-slate-100 dark:border-white/10 overflow-hidden shrink-0">
              <img 
                src={user.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName || 'User'}`} 
                alt="profile" 
                className="w-full h-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-right overflow-hidden animate-in fade-in duration-300">
                <span className="text-sm font-black text-slate-900 dark:text-white truncate">{user.fullName || "مستخدم"}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">{user.role || "viewer"}</span>
              </div>
            )}
          </div>
        )}
        <button 
          onClick={onSignOut}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/5 rounded-2xl transition-all group`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="font-bold text-sm animate-in fade-in duration-300">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;