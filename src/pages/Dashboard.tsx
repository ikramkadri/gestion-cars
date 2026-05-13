import React from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Car, DollarSign, TrendingUp, TrendingDown, 
  Activity, CheckCircle2, Package
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Doc } from "../../convex/_generated/dataModel";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  trend?: string;
  isUp?: boolean;
}

const StatsCard = ({ icon: Icon, label, value, color, trend, isUp }: StatCardProps) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`${color} p-3 rounded-2xl text-white shadow-lg shadow-current/20`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-xs font-black ${isUp ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'} px-2 py-1 rounded-full`}>
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {trend}
        </span>
      )}
    </div>
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</p>
    <h3 className="text-2xl font-black text-slate-900 mt-1 tabular-nums">{value}</h3>
  </div>
);

type ActivityLogWithUserName = Doc<"activity_logs"> & { userName: string; };
type SaleWithCarAndCustomerName = Doc<"sales"> & { carName: string; customerName: string; };

const Dashboard = () => {
  const token = localStorage.getItem("convex_token") ?? undefined;
  // جلب بيانات المستخدم الحالي لمعرفة الرتبة والاسم
  const user = useQuery(api.users.viewer, { token });

  // 1. ربط الإحصائيات المالية والمخزون
  const stats = useQuery(api.statistics.getDashboardStats);
  
  // 2. ربط أحدث المبيعات (أخذ آخر 5 مبيعات)
  const recentSales = useQuery(api.sales.getRecentSales, { limit: 5 });

  // 3. ربط سجل النشاطات (Activity Feed)
  const latestLogs = useQuery(api.activity_logs.getLatestLogs, { token });

  if (!stats) return <div className="p-10 text-center font-bold">جاري تحميل البيانات...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans" dir="rtl">
      {/* الـ Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            {user?.role === 'admin' ? 'مرحباً أدمن! 👑' : `مرحباً بك يا زبوننا العزيز، ${user?.fullName || ''} 👋`}
          </h1>
          <p className="text-slate-500 font-bold">نظام MOTORIX جاهز، إليك ملخص الأداء اليوم.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-xs font-bold">
          آخر تحديث: {new Date(stats.lastUpdate).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* كروت الإحصائيات (StatsCards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {(user?.role === 'admin' || user?.role === 'sales_manager') && (
          <StatsCard 
            icon={DollarSign} 
            color="bg-indigo-600" 
            label="إجمالي المبيعات" 
            value={`${stats.financials.totalRevenue.toLocaleString()} د.ج`}
            trend="+12.5%"
            isUp={true}
          />
        )}
        {user?.role === 'admin' && (
          <StatsCard 
            icon={TrendingUp} 
            color="bg-emerald-500" 
            label="صافي الأرباح" 
            value={`${stats.financials.totalProfit.toLocaleString()} د.ج`}
            isUp={true}
          />
        )}
        <StatsCard 
          icon={Car} 
          color="bg-slate-900" 
          label="المخزون المتوفر" 
          value={`${stats.inventory.available} سيارة`}
        />
        {user?.role === 'admin' && (
          <StatsCard 
            icon={Package} 
            color="bg-amber-500" 
            label="قيمة المخزون" 
            value={`${(stats.financials.stockValue / 1000000).toFixed(1)}M د.ج`}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* الرسم البياني (AreaChart) */}
        {user?.role !== 'viewer' ? (
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-800 text-lg">تحليل المبيعات الشهرية</h3>
            <select className="bg-slate-50 border-none rounded-xl text-xs font-bold p-2 outline-none">
              <option>آخر 6 أشهر</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        ) : (
          <div className="lg:col-span-2 bg-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-center items-center text-center">
             <Car size={60} className="mb-4 opacity-20" />
             <h3 className="text-2xl font-black mb-2">استكشف المخزون</h3>
             <p className="font-bold opacity-80">يمكنك مشاهدة السيارات المتوفرة والبحث عن مواصفاتها من قسم المخزون.</p>
          </div>
        )}

        {/* سجل النشاطات (Activity Feed) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" /> سجل النشاطات
          </h3>
          <div className="space-y-6">
            {latestLogs?.map((log: ActivityLogWithUserName) => (
              <div key={log._id} className="flex gap-4 items-start relative pb-6 border-r-2 border-slate-50 last:border-0 pr-4">
                <div className="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-500" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-black text-slate-800">{log.userName}</p>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString('ar-DZ')}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {log.action === "SALE_CREATED" ? "أتم عملية بيع جديدة" : "قام بتحديث بيانات النظام"}
                    <span className="block text-indigo-600 font-bold mt-1">{log.details}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* جدول أحدث العمليات (Recent Sales) */}
      {user?.role !== 'viewer' && (
      <div className="mt-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-800 text-lg">أحدث المبيعات</h3>
          <button className="text-indigo-600 text-xs font-black hover:underline">عرض الكل</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">المركبة</th>
                <th className="px-8 py-4">الزبون</th>
                <th className="px-8 py-4">المبلغ</th>
                <th className="px-8 py-4">التاريخ</th>
                <th className="px-8 py-4 text-left">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentSales?.map((sale: SaleWithCarAndCustomerName) => (
                <tr key={sale._id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Car size={16} />
                      </div>
                      <span className="font-black text-slate-800">{sale.carName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{sale.customerName}</td>
                  <td className="px-8 py-5 font-black text-slate-900 tabular-nums">
                    {sale.amountPaid.toLocaleString()} د.ج
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-400 font-bold">
                    {new Date(sale.saleDate).toLocaleDateString('ar-DZ')}
                  </td>
                  <td className="px-8 py-5 text-left">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-100">
                      <CheckCircle2 size={12} /> مكتمل
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};

export default Dashboard;