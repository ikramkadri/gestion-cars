import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { TrendingUp, BarChart3, ArrowUpRight, Loader2, Users, Clock, Target, Award, MousePointer2 } from 'lucide-react'; // Removed unused Wallet, Package, Receipt
import DashboardChart from '../components/DashboardChart';
import StatsCard from '../components/StatsCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface BrandStat {
  name: string;
  value: number;
}

interface SellerStat {
  name: string;
  total: number;
  count: number;
}

interface SourceStat {
  name: string;
  value: number;
}

const StatisticsPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  const stats = useQuery(api.statistics.getDashboardStats, { token });

  if (!stats) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD] dark:bg-slate-950">
      <Loader2 className="animate-spin text-blue-600 dark:text-blue-405" size={40} />
    </div>
  );

  // ألوان متناسقة للرسم البياني الدائري
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];
  const SOURCE_COLORS = ['#3b82f6', '#22c55e', '#1877f2', '#f97316'];

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-slate-950 p-8 font-sans text-right transition-colors duration-300" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <BarChart3 className="text-rose-500" size={32} /> إحصائيات الأرباح والنمو
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold italic">التحليل المالي الدقيق لأداء معرض Motorix</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          label="صافي الربح الحقيقي"
          val={stats.financials.totalProfit}
          unit="دج"
          icon={TrendingUp}
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-950/20"
        />
        <StatsCard 
          label="متوسط وقت البيع"
          val={stats.inventory.averageDaysToSell}
          unit="يوم"
          icon={Clock}
          color="text-indigo-600 dark:text-indigo-400"
          bg="bg-indigo-50 dark:bg-indigo-950/20"
        />
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2"><Target size={14} className="text-rose-500"/> معدل التحويل (CRO)</p>
          <div className="flex items-end justify-between">
            <h4 className="text-4xl font-black text-slate-900 dark:text-white">{stats.financials.conversionRate}%</h4>
            <div className="flex items-center text-emerald-500 dark:text-emerald-400 font-black text-xs bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} /> +5.2%
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-600 dark:bg-indigo-505 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.financials.conversionRate}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DashboardChart />
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
          <h3 className="font-black text-slate-800 dark:text-white text-lg mb-6 flex items-center gap-2">توزيع الماركات المباعة</h3>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
              <PieChart>
                <Pie
                  data={stats.brandDistribution || []}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.brandDistribution.map((_entry: BrandStat, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* الرسم البياني الجديد لمصادر المبيعات */}
          <div className="mt-10 pt-10 border-t dark:border-slate-800">
            <h3 className="font-black text-slate-800 dark:text-white text-sm mb-6 flex items-center gap-2">
              <MousePointer2 size={18} className="text-blue-500" /> من أين يأتي المشترون؟
            </h3>
            <div className="h-48 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                <PieChart>
                  <Pie
                     data={stats.sourceDistribution || []}
                     innerRadius={40}
                     outerRadius={60}
                     paddingAngle={8}
                     dataKey="value"
                  >
                    {(stats.sourceDistribution || []).map((_entry: SourceStat, index: number) => (
                      <Cell key={`source-cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* لوحة الشرف للموظفين */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-4 border-t dark:border-slate-800 pt-6">
               <h3 className="font-black text-slate-800 dark:text-white text-sm flex items-center gap-2">
                 <Award size={18} className="text-amber-500" /> ترتيب فريق المبيعات
               </h3>
               <Users size={16} className="text-slate-300 dark:text-slate-650" />
            </div>
            
            {stats.leaderboard?.length > 0 ? stats.leaderboard.map((seller: SellerStat, i: number) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[10px] font-black border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200">{i+1}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{seller.name}</span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{(seller.total || 0).toLocaleString()} دج</p>
                  <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500">{seller.count} عمليات بيع</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 italic">لا توجد بيانات كافية للترتيب حالياً</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;