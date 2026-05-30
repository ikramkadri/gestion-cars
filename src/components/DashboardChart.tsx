import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingUp } from "lucide-react";

const DashboardChart = () => {
  const token = localStorage.getItem("convex_token") || "";
  const stats = useQuery(api.statistics.getDashboardStats, { token });

  if (!stats) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center bg-slate-900/5 rounded-[2rem] border border-dashed border-slate-200">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const data = stats.chartData;

  return (
    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden group">
      {/* تأثير إضاءة خلفي خلف الرسم البياني */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10" />
      
      <div className="flex items-center justify-between mb-8" dir="rtl">
        <div>
          <h3 className="text-white text-xl font-black flex items-center gap-2">
            <TrendingUp className="text-blue-400" size={20} />
            أداء المبيعات
          </h3>
          <p className="text-slate-400 text-xs font-bold mt-1">إحصائيات الإيرادات لآخر 6 أشهر</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
          <span className="text-blue-400 font-black text-sm">
            {stats.financials.totalRevenue.toLocaleString()} دج
          </span>
        </div>
      </div>

      {/* الحل البرمجي: تغليف المكون بـ div له ارتفاع محدد */}
      <div className="h-[350px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#1e293b" 
            />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
              dy={15}
            />
            <YAxis 
              hide 
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: '1px solid #1e293b', 
                borderRadius: '16px',
                color: '#fff',
                fontWeight: 'bold',
                textAlign: 'right',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#3b82f6' }}
              formatter={(value: string | number | readonly (string | number)[] | undefined) => {
                if (value === undefined || value === null) {
                  return ['N/A', "الإيرادات"];
                }
                const displayValue = Array.isArray(value) ? value[0] : value;
                return [`${Number(displayValue).toLocaleString()} دج`, "الإيرادات"];
              }}
              labelStyle={{ marginBottom: '4px', color: '#94a3b8' }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;