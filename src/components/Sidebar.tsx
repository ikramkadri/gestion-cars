import React from 'react';
import { 
  LayoutDashboard, Car, Settings, LogOut, 
  Users, BookOpen, FileText, BarChart3, 
  History, Bell 
} from 'lucide-react';

interface SidebarProps {
  active: string;
  setActive: (id: string) => void; // إضافة دالة التغيير
}

const Sidebar: React.FC<SidebarProps> = ({ active, setActive }) => {
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'inventory', label: 'المخزون', icon: Car },
    { id: 'statistics', label: 'الإحصائيات', icon: BarChart3 }, 
    { id: 'bookings', label: 'الحجوزات', icon: BookOpen },
    { id: 'invoices', label: 'الفواتير', icon: FileText },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'logs', label: 'سجل العمليات', icon: History },
    { id: 'users', label: 'المستخدمين', icon: Users },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <aside className="fixed right-0 top-0 h-full w-64 bg-slate-950 text-white p-6 flex flex-col shadow-2xl z-[100] border-l border-slate-800" dir="rtl">
      
      <div className="flex items-center gap-3 mb-10 px-2 py-4">
        <div className="relative">
          <div className="absolute -inset-1 bg-blue-500 rounded-lg blur opacity-25"></div>
          <div className="relative bg-blue-600 p-2 rounded-lg">
            <Car size={24} className="text-white" />
          </div>
        </div>
        <div className="flex flex-col text-right">
          <h1 className="text-xl font-black tracking-tighter text-white">MOTORIX</h1>
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Management</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)} // الربط هنا
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
              active === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                : 'text-slate-500 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <item.icon 
              size={18} 
              className={active === item.id ? 'text-white' : 'group-hover:text-blue-400'} 
            />
            <span className="font-bold text-sm">{item.label}</span>
            {active === item.id && (
              <div className="mr-auto w-1.5 h-1.5 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-900 pt-4">
        <div className="mb-4 px-4 py-3 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">المسؤول</p>
          <p className="text-xs font-bold text-white">إكرام قادري</p>
        </div>
        <button className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all group">
          <LogOut size={18} />
          <span className="font-bold text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;