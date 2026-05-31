import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { TrendingUp, BarChart3, Users, Clock, Target, Award, MousePointer2 } from 'lucide-react';
import DashboardChart from '../components/DashboardChart';
import StatsCard from '../components/StatsCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/statistics/ar.json';
import en from '../lib/i18n/pages/statistics/en.json';
import fr from '../lib/i18n/pages/statistics/fr.json';

interface BrandStat { name: string; value: number; }
interface SellerStat { name: string; total: number; count: number; }
interface SourceStat { name: string; value: number; }

// ST3: Resolve chart colors from CSS custom properties
function getChartColor(index: number): string {
  const num = (index % 5) + 1;
  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(`--chart-${num}`).trim();
    if (value) return `hsl(${value})`;
  } catch {
    // fall through
  }
  const fallback = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];
  return fallback[index % fallback.length];
}

const StatisticsSkeleton = () => (
  <div className="min-h-screen bg-background p-4 md:p-8 font-sans transition-colors duration-300" dir="rtl">
    <div className="mb-10">
      <div className="h-8 w-48 bg-muted rounded-xl animate-pulse mb-2" />
      <div className="h-4 w-32 bg-muted rounded-lg animate-pulse" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-card p-6 rounded-[2rem] border-border">
          <div className="h-3 w-20 bg-muted rounded-md animate-pulse mb-3" />
          <div className="h-8 w-28 bg-muted rounded-lg animate-pulse mb-2" />
          <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 h-[350px] bg-card rounded-[2.5rem] border-border animate-pulse" />
      <div className="h-[500px] bg-card rounded-[2.5rem] border-border animate-pulse" />
    </div>
  </div>
);

const StatisticsPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  const stats = useQuery(api.statistics.getDashboardStats, { token });
  const { t } = usePageTranslation({ ar, en, fr });

  if (!stats) return <StatisticsSkeleton />;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans text-right transition-colors duration-300" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
          <BarChart3 className="text-rose-500" size={32} /> {t('page_title')}
        </h1>
        <p className="text-muted-foreground font-bold italic">{t('page_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          label={t('net_profit')}
          val={stats.financials.totalProfit}
          unit="دج"
          icon={TrendingUp}
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <StatsCard 
          label={t('avg_sale_time')}
          val={stats.inventory.averageDaysToSell}
          unit={t('days')}
          icon={Clock}
          color="text-indigo-600 dark:text-indigo-400"
          bg="bg-indigo-50 dark:bg-indigo-500/10"
        />
        <div className="bg-card p-8 rounded-[2.5rem] border-border shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Target size={14} className="text-rose-500"/> {t('conversion_rate')}
          </p>
          <div className="flex items-end justify-between">
            <h4 className="text-4xl font-black text-foreground">{stats.financials.conversionRate}%</h4>
          </div>
          <div className="w-full bg-muted h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.financials.conversionRate}%` }} />
          </div>
        </div>
        <StatsCard 
          label={t('active_customers') || 'Customers'}
          val={stats.financials.totalRevenue}
          unit=""
          icon={Users}
          color="text-purple-600 dark:text-purple-400"
          bg="bg-purple-50 dark:bg-purple-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DashboardChart />
        </div>
        
        <div className="bg-card p-8 rounded-[2.5rem] border-border shadow-sm">
          <h3 className="font-black text-card-foreground text-lg mb-6 flex items-center gap-2">
            {t('brand_distribution')}
          </h3>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
              <PieChart>
                <Pie
                  data={stats.brandDistribution || []}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }: { name?: string; value?: number }) => `${name || ''} (${value || 0})`}
                  labelLine={true}
                >
                  {stats.brandDistribution.map((_entry: BrandStat, index: number) => (
                    <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-10 pt-10 border-t border-border">
            <h3 className="font-black text-card-foreground text-sm mb-6 flex items-center gap-2">
              <MousePointer2 size={18} className="text-blue-500" /> {t('sales_sources')}
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
                     label={({ name, value }: { name?: string; value?: number }) => `${name || ''} (${value || 0})`}
                     labelLine={true}
                  >
                    {(stats.sourceDistribution || []).map((_entry: SourceStat, index: number) => (
                      <Cell key={`source-cell-${index}`} fill={getChartColor(index + 5)} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-4 border-t border-border pt-6">
               <h3 className="font-black text-card-foreground text-sm flex items-center gap-2">
                 <Award size={18} className="text-amber-500" /> {t('sales_leaderboard')}
               </h3>
               <Users size={16} className="text-muted-foreground/50" />
            </div>
            
            {stats.leaderboard?.length > 0 ? stats.leaderboard.map((seller: SellerStat, i: number) => (
              <div key={i} className="flex justify-between items-center bg-muted/40 p-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-card flex items-center justify-center text-[10px] font-black border-border text-foreground">{i+1}</span>
                  <span className="text-xs font-bold text-foreground">{seller.name}</span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{(seller.total || 0).toLocaleString()} دج</p>
                  <p className="text-[8px] font-bold text-muted-foreground">{t('sales_count').replace('{count}', String(seller.count))}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-[10px] text-muted-foreground italic">{t('no_leaderboard_data') || 'No data available yet'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
