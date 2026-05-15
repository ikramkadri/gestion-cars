import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Car, Settings, LogOut, 
  Users, BookOpen, FileText, BarChart3, ShieldCheck,
  ShoppingCart,
  ChevronRight, ChevronLeft, UserCheck, Receipt, PlusCircle, Archive, Bell, Search,
  ShieldAlert
} from 'lucide-react';
import type { Doc } from '../../convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Id } from '../../convex/_generated/dataModel'; // Import Id for storageId
import { api } from '../../convex/_generated/api';

interface UserType extends Doc<"users"> {
  role: "admin" | "sales_manager" | "viewer";
  fullName: string;
  imageUrl?: string;
}

interface SidebarProps {
  user?: UserType | null;
  onSignOut?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onSignOut }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const token = localStorage.getItem("convex_token") || "";

  // جلب عدد التنبيهات غير المقروءة الحقيقي
  const unreadCount = useQuery(api.notifications.getUnreadCount, { token }) ?? 0;

  const settings = useQuery(api.site_settings.getSettings);
  const logoImageUrl = useQuery(
    api.files.getImageUrl,
    settings?.logoImageId ? { storageId: settings.logoImageId as Id<"_storage"> } : "skip"
  );

  // تعريف القائمة بناءً على رتبة المستخدم
  const menuItems = useMemo(() => [
    // --- هيكلة الزبون (Viewer / Customer) ---
    ...(user?.role === 'viewer' ? [
      { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, color: 'text-blue-500' },
      { id: 'inventory', label: 'تصفح السيارات', icon: Search, color: 'text-emerald-500' },
      // دمج الحجوزات والمشتريات في "طلباتي"
      { id: 'orders', label: 'طلباتي ومشترياتي', icon: ShoppingCart, color: 'text-indigo-500' },
      { id: 'notifications', label: 'التنبيهات', icon: Bell, color: 'text-amber-500', badge: unreadCount > 0 ? unreadCount : undefined },
      { id: 'settings', label: 'إعدادات الحساب', icon: UserCheck, color: 'text-slate-400' },
    ] : [
      // --- هيكلة الموظفين (Admin / Sales Manager) ---
      { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, color: 'text-blue-500' },
      { id: 'inventory', label: 'المخزون', icon: Car, color: 'text-emerald-500' },
      { id: 'customers', label: 'الزبائن', icon: Users, color: 'text-violet-500' },
      { id: 'notifications', label: 'التنبيهات', icon: Bell, color: 'text-amber-500', badge: unreadCount > 0 ? unreadCount : undefined },
      
      ...(user?.role === 'admin' || user?.role === 'sales_manager' ? [
        { id: 'inventory/add', label: 'إضافة سيارة', icon: PlusCircle, color: 'text-blue-500' },
        { id: 'bookings', label: 'طلبات الحجز', icon: BookOpen, color: 'text-sky-500' },
        { id: 'sales', label: 'عملية بيع', icon: ShoppingCart, color: 'text-amber-500' },
        { id: 'invoices', label: 'الفواتير', icon: FileText, color: 'text-pink-500' },
        { id: 'inventory/archived', label: 'الأرشيف', icon: Archive, color: 'text-slate-400' },
      ] : []),

      ...(user?.role === 'admin' ? [
        { id: 'statistics', label: 'التقارير المالية', icon: BarChart3, color: 'text-rose-500' },
        { id: 'expenses', label: 'إدارة المصاريف', icon: Receipt, color: 'text-orange-500' },
        { id: 'users', label: 'إدارة الموظفين', icon: ShieldCheck, color: 'text-indigo-500' },
        { id: 'settings', label: 'إعدادات النظام', icon: Settings, color: 'text-slate-400' },
      ] : [{ id: 'settings', label: 'حسابي الشخصي', icon: UserCheck, color: 'text-slate-400' }]),
    ]),
  ], [user?.role, unreadCount]);

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
        {logoImageUrl ? (
          <img src={logoImageUrl} alt="Showroom Logo" className="w-10 h-10 object-contain" />
        ) : (
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
            <Car size={24} className="text-white" />
          </div>
        )}
        {!isCollapsed && (
          <div className="flex flex-col text-right animate-in fade-in duration-300">
            <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">{settings?.showroomName || "MOTORIX"}</h1>
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
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm tracking-wide animate-in fade-in duration-300">{item.label}</span>
                    {item.badge && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{item.badge}</span>}
                  </div>
                )}
                {isActive && !isCollapsed && <div className="mr-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
        {/* تنبيه حساب غير موثق - الرحلة العالمية */}
        {!isCollapsed && user && !user.verified && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl animate-in slide-in-from-bottom-2">
            <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black leading-tight">يرجى توثيق حسابك</p>
                <p className="text-[9px] font-medium opacity-80">لتتمكن من إتمام عمليات الحجز.</p>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-6 px-2`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-blue-600/20 border border-slate-100 dark:border-white/10 overflow-hidden shrink-0">
              <img 
                src={user.imageUrl || "/images/default-avatar.png"} 
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
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/5 rounded-2xl transition-all group active:scale-95`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="font-bold text-sm animate-in fade-in duration-300">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;