import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Car, DollarSign, TrendingUp, Activity, Package, CheckCircle2, LayoutGrid, Users, BookOpen, Wallet } from 'lucide-react';
import { SaleWithDetails } from '../types/app';
import DashboardChart from '../components/DashboardChart';
import { Doc } from '../../convex/_generated/dataModel';
import StatsCard from '../components/StatsCard';
import { useLanguage } from '../lib/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const token = localStorage.getItem("convex_token") ?? undefined;
  const navigate = useNavigate();
  const { t, language, isRtl } = useLanguage();
  // جلب بيانات المستخدم الحالي لمعرفة الرتبة والاسم
  const user = useQuery(api.users.viewer, { token }); // يجب أن يكون token هنا هو token أو undefined

  // 1. ربط الإحصائيات المالية والمخزون
  const stats = useQuery(api.statistics.getDashboardStats, { token: token || undefined });
  
  // 2. ربط أحدث المبيعات (أخذ آخر 5 مبيعات)
  const recentSales = useQuery(api.sales.getRecentSales, { token: token || undefined, limit: 5 });

  // 3. ربط سجل النشاطات (Activity Feed)
  const latestLogs = useQuery(api.activity_logs.getLatestLogs, { token });

  if (!stats) return <div className="p-10 text-center font-bold">جاري تحميل البيانات...</div>;

  const welcomeMsg = user?.role === 'admin' ? t('welcome_admin') : 
                   user?.role === 'sales_manager' ? `${t('welcome_sales')}, ${user.fullName.split(' ')[0]}` :
                   `Welcome to MOTORIX, ${user?.fullName || ''}`;

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* الـ Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            {welcomeMsg}
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
            color="text-white" 
            bg="bg-indigo-600"
            label={t('total_sales')}
            val={stats.financials.totalRevenue.toLocaleString()}
            unit={language === 'ar' ? 'د.ج' : 'DZD'}
          />
        )}
        {user?.role === 'admin' && ( // خصوصية الأرباح للأدمن فقط
          <StatsCard 
            icon={TrendingUp} 
            color="text-white"
            bg="bg-emerald-500"
            label="صافي الأرباح" 
            val={stats.financials.totalProfit.toLocaleString()}
            unit="د.ج"
          />
        )}
        <StatsCard // الموظف يرى حجم المخزون لتسهيل البيع
          icon={Car} 
          color="text-white"
          bg="bg-slate-900"
          label="المخزون المتوفر" 
          val={stats.inventory.available.toString()}
          unit="سيارة"
        />
        {user?.role === 'admin' && ( // الموظف لا يرى رأس المال المستثمر في المخزون
          <StatsCard 
            icon={Package} 
            color="text-white"
            bg="bg-amber-500"
            label="قيمة المخزون" 
            val={(stats.financials.stockValue / 1000000).toFixed(1)}
            unit="M د.ج"
          />
        )}
      </div>

      {/* قسم الإجراءات السريعة - حصري للأدمن - "السلايد المعمر" */}
      {user?.role === 'admin' && (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <LayoutGrid size={20} className="text-indigo-600" /> مركز القيادة السريع
              </h3>
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-tighter">Admin Access Only</span>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => navigate('/admin/inventory/add')} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col items-center gap-3 group">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Car size={24} />
                 </div>
                 <span className="font-black text-xs text-slate-600">إضافة مركبة</span>
              </button>
              <button onClick={() => navigate('/admin/bookings')} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex flex-col items-center gap-3 group">
                 <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                    <BookOpen size={24} />
                 </div>
                 <span className="font-black text-xs text-slate-600">إدارة الحجوزات</span>
              </button>
              <button onClick={() => navigate('/admin/users')} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col items-center gap-3 group">
                 <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <Users size={24} />
                 </div>
                 <span className="font-black text-xs text-slate-600">الموظفين</span>
              </button>
              <button onClick={() => navigate('/admin/statistics')} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col items-center gap-3 group">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Wallet size={24} />
                 </div>
                 <span className="font-black text-xs text-slate-600">التقارير المالية</span>
              </button>
           </div>
        </div>
      )}

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
            {latestLogs?.map((log: Doc<"activity_logs"> & { userName: string }) => (
              <div key={log._id} className="flex gap-4 items-start relative pb-6 border-r-2 border-slate-50 last:border-0 pr-4">
                <div className="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-500" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-black text-slate-800">{log.userName}</p>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(log.createdAt).toLocaleTimeString('ar-DZ')}</span>
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
              {recentSales?.map((sale: SaleWithDetails) => (
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