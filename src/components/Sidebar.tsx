import React from 'react';
import { 
  LayoutDashboard, Car, Settings, LogOut, 
  Users, BookOpen, FileText, BarChart3, 
  History, Bell, ShoppingCart, ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  active: string;
  setActive: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, setActive }) => {
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'inventory', label: 'المخزون', icon: Car, color: 'text-emerald-500' },
    { id: 'customers', label: 'الزبائن', icon: Users, color: 'text-violet-500' },
    { id: 'sales', label: 'المبيعات', icon: ShoppingCart, color: 'text-amber-500' },
    { id: 'statistics', label: 'الإحصائيات', icon: BarChart3, color: 'text-rose-500' },
    { id: 'bookings', label: 'الحجوزات', icon: BookOpen, color: 'text-sky-500' },
    { id: 'invoices', label: 'الفواتير', icon: FileText, color: 'text-pink-500' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, color: 'text-slate-400' },
  ];

  return (
    <aside className="fixed right-0 top-0 h-full w-72 bg-slate-950 text-white p-6 flex flex-col shadow-2xl z-[100] border-l border-white/5" dir="rtl">
      <div className="flex items-center gap-3 mb-10 px-2 py-4 border-b border-white/5">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
          <Car size={24} className="text-white" />
        </div>
        <div className="flex flex-col text-right">
          <h1 className="text-xl font-black tracking-tighter text-white">MOTORIX</h1>
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Management</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              active === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                : 'text-slate-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon 
              size={18} 
              className={active === item.id ? 'text-white' : `${item.color} group-hover:scale-110 transition-transform`} 
            />
            <span className="font-bold text-sm tracking-wide">{item.label}</span>
            {active === item.id && (
              <div className="mr-auto w-1.5 h-1.5 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/5">
        <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl transition-all group">
          <LogOut size={18} />
          <span className="font-bold text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;