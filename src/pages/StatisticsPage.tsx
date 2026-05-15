import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { TrendingUp, BarChart3, ArrowUpRight, Loader2, Users, Receipt, Clock, Target, Award } from 'lucide-react'; // Removed unused Wallet, Package
import DashboardChart from '../components/DashboardChart';
import StatsCard from '../components/StatsCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const StatisticsPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  const stats = useQuery(api.statistics.getDashboardStats, { token });

  if (!stats) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  // ألوان متناسقة للرسم البياني الدائري
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans text-right" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <BarChart3 className="text-rose-500" size={32} /> إحصائيات الأرباح والنمو
        </h1>
        <p className="text-slate-500 font-bold italic">التحليل المالي الدقيق لأداء معرض Motorix</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          label="صافي الربح الحقيقي"
          val={stats.financials.totalProfit}
          unit="دج"
          icon={TrendingUp}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatsCard 
          label="إجمالي المصاريف"
          val={stats.financials.expenses}
          unit="دج"
          icon={Receipt}
          color="text-rose-600"
          bg="bg-rose-50"
        />
        <StatsCard 
          label="متوسط وقت البيع"
          val={stats.inventory.averageDaysToSell}
          unit="يوم"
          icon={Clock}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target size={14} className="text-rose-500"/> معدل التحويل (CRO)</p>
          <div className="flex items-end justify-between">
            <h4 className="text-4xl font-black text-slate-900">{stats.financials.conversionRate}%</h4>
            <div className="flex items-center text-emerald-500 font-black text-xs bg-emerald-50 px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} /> +5.2%
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.financials.conversionRate}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DashboardChart />
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">توزيع الماركات المباعة</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.brandDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.brandDistribution.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* لوحة الشرف للموظفين */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-4 border-t pt-6">
               <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                 <Award size={18} className="text-amber-500" /> ترتيب فريق المبيعات
               </h3>
               <Users size={16} className="text-slate-300" />
            </div>
            
            {stats.leaderboard?.length > 0 ? stats.leaderboard.map((seller: any, i: number) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black border border-slate-100">{i+1}</span>
                  <span className="text-xs font-bold text-slate-700">{seller.name}</span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-indigo-600">{(seller.total || 0).toLocaleString()} دج</p>
                  <p className="text-[8px] font-bold text-slate-400">{seller.count} عمليات بيع</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-[10px] text-slate-400 italic">لا توجد بيانات كافية للترتيب حالياً</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;