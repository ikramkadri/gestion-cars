"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { 
  CarFront, 
  BadgeDollarSign, 
  TrendingUp, 
  LayoutDashboard,
  Timer
} from "lucide-react";

export default function Dashboard() {
  const stats = useQuery(api.statistics.getDashboardStats);

  if (!stats) return (
    <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500 font-medium">
      جاري الاتصال بقاعدة البيانات...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10" dir="rtl">
      {/* العنوان */}
      <div className="max-w-7xl mx-auto mb-10 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <LayoutDashboard size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">نظام إدارة معرض السيارات</h1>
          <p className="text-slate-500 text-sm">النموذج الأولي للوحة التحكم</p>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          label="السيارات المتوفرة" 
          value={stats.inventory.available} 
          icon={<CarFront className="text-blue-600" />} 
          desc="سيارات جاهزة للبيع"
        />
        <StatCard 
          label="إجمالي المبيعات" 
          value={stats.inventory.sold} 
          icon={<Timer className="text-emerald-600" />} 
          desc="عمليات بيع مكتملة"
        />
        <StatCard 
          label="إجمالي المداخيل" 
          value={`${stats.financials.totalRevenue.toLocaleString()} دج`} 
          icon={<BadgeDollarSign className="text-amber-600" />} 
          desc="مبالغ تم قبضها"
        />
        <StatCard 
          label="صافي الأرباح" 
          value={`${stats.financials.totalProfit.toLocaleString()} دج`} 
          icon={<TrendingUp className="text-rose-600" />} 
          desc="بعد خصم تكاليف الشراء"
          dark
        />
      </div>

      {/* قسم مالي إضافي */}
      <div className="max-w-7xl mx-auto bg-white border border-slate-200 p-6 rounded-2xl flex justify-between items-center shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800">قيمة المخزون الحالي</h3>
          <p className="text-slate-500 text-sm">إجمالي مبالغ شراء السيارات التي لم تُبع بعد</p>
        </div>
        <div className="text-2xl font-black text-blue-600">
          {stats.financials.inventoryCost.toLocaleString()} دج
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, desc, dark = false }: any) {
  return (
    <div className={`p-6 rounded-2xl border transition-all hover:shadow-md ${dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl ${dark ? 'bg-slate-800' : 'bg-slate-50'}`}>{icon}</div>
      </div>
      <p className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
      <h2 className="text-2xl font-black mt-1">{value}</h2>
      <p className={`text-[10px] mt-2 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>{desc}</p>
    </div>
  );
}