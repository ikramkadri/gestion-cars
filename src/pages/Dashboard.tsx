import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Car, DollarSign, TrendingUp, Activity, Package, CheckCircle2 } from 'lucide-react';
import { Doc } from "../../convex/_generated/dataModel";
import { SaleWithDetails } from '../types/app'; // Removed unused imports
import DashboardChart from '../components/DashboardChart';
import StatsCard from '../components/StatsCard';
type ActivityLogWithUserName = Doc<"activity_logs"> & { userName: string; };
type SaleWithCarAndCustomerName = SaleWithDetails;

const Dashboard = () => {
  const token = localStorage.getItem("convex_token") ?? undefined;
  // جلب بيانات المستخدم الحالي لمعرفة الرتبة والاسم
  const user = useQuery(api.users.viewer, { token }); // يجب أن يكون token هنا هو token أو undefined

  // 1. ربط الإحصائيات المالية والمخزون
  const stats = useQuery(api.statistics.getDashboardStats, { token: token || undefined });
  
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
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            {user?.role === 'admin' ? 'لوحة التحكم القيادية 👑' : 
             user?.role === 'sales_manager' ? `أهلاً بك بطل المبيعات، ${user.fullName.split(' ')[0]} 🚀` :
             `مرحباً بك في MOTORIX، ${user?.fullName || ''} 👋`}
          </h1>
          <p className="text-slate-500 font-bold mt-2">
            {user?.role === 'sales_manager' ? 'إليك ملخص إنجازاتك الشخصية لهذا اليوم.' : 'نظرة عامة على أسطول السيارات والنشاط التجاري.'}
          </p>
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
            bg="bg-indigo-600"
            label={user?.role === 'admin' ? "إجمالي مبيعات المعرض" : "حجم مبيعاتك الشخصية"}
            val={stats.financials.totalRevenue.toLocaleString()}
            unit="د.ج"
          />
        )}
        {user?.role === 'admin' && ( // خصوصية الأرباح للأدمن فقط
          <StatsCard 
            icon={TrendingUp} 
            color="bg-emerald-500"
            bg="bg-emerald-500"
            label="صافي الأرباح" 
            val={stats.financials.totalProfit.toLocaleString()}
            unit="د.ج"
          />
        )}
        <StatsCard // الموظف يرى حجم المخزون لتسهيل البيع
          icon={Car} 
          color="bg-slate-900"
          bg="bg-slate-900"
          label="المخزون المتوفر" 
          val={stats.inventory.available.toString()}
          unit="سيارة"
        />
        {user?.role === 'admin' && ( // الموظف لا يرى رأس المال المستثمر في المخزون
          <StatsCard 
            icon={Package} 
            color="bg-amber-500"
            bg="bg-amber-500"
            label="قيمة المخزون" 
            val={(stats.financials.stockValue / 1000000).toFixed(1)}
            unit="M د.ج"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* الرسم البياني (AreaChart) */}
        {user?.role !== 'viewer' ? ( // عرض الرسم البياني فقط لغير المشاهدين
          <div className="lg:col-span-2">
            <DashboardChart />
          </div>
        ) : ( // رسالة للمشاهدين
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
                <th className="px-8 py-4">البائع</th>
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
                  <td className="px-8 py-5 text-sm font-bold text-slate-600"> {/* تم التعديل لعرض اسم البائع */}
                    {sale.sellerName}
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