import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Car, DollarSign, TrendingUp, Activity, Package, CheckCircle2, 
  LayoutGrid, Users, BookOpen, Wallet, Clock, ChevronLeft 
} from 'lucide-react';
import { SaleWithDetails } from '../types/app';
import DashboardChart from '../components/DashboardChart';
import { Doc } from '../../convex/_generated/dataModel';
import StatsCard from '../components/StatsCard';
import ar from '../lib/i18n/pages/dashboard/ar.json';
import en from '../lib/i18n/pages/dashboard/en.json';
import fr from '../lib/i18n/pages/dashboard/fr.json';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import { timeAgo } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../lib/useReducedMotion';

// ---- Animation Variants ----
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// ---- Skeleton Loading ----
const DashboardSkeleton = () => (
  <div className="p-4 md:p-8 space-y-10">
    {/* Header skeleton */}
    <div className="flex justify-between items-center">
      <div className="space-y-3">
        <div className="h-8 w-64 bg-muted rounded-xl animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="h-8 w-36 bg-muted rounded-xl animate-pulse" />
    </div>

    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card rounded-[2.5rem] border border-border p-8 space-y-6">
          <div className="w-14 h-14 bg-muted rounded-[1.2rem] animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            <div className="h-7 w-32 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      ))}
    </div>

    {/* Chart + Activity skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 h-[400px] bg-card rounded-[2.5rem] border border-border animate-pulse" />
      <div className="h-[400px] bg-card rounded-[2.5rem] border border-border animate-pulse" />
    </div>
  </div>
);

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ size?: number; className?: string }>; 
  title: string; 
  description: string;
}) => (
  <div className="flex flex-col items-center justify-center py-14 px-6">
    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
      <Icon size={28} className="text-muted-foreground/60" />
    </div>
    <p className="text-sm font-black text-card-foreground mb-1">{title}</p>
    <p className="text-xs font-medium text-muted-foreground text-center max-w-[220px]">{description}</p>
  </div>
);

const Dashboard = () => {
  const reduced = useReducedMotion();

  const token = localStorage.getItem("convex_token") ?? undefined;
  const navigate = useNavigate();
  const { t, language, isRtl } = usePageTranslation({ ar, en, fr });
  const user = useQuery(api.users.viewer, { token });
  const stats = useQuery(api.statistics.getDashboardStats, { token: token || undefined });
  const recentSales = useQuery(api.sales.getRecentSales, { token: token || undefined, limit: 5 });
  const latestLogs = useQuery(api.activity_logs.getLatestLogs, { token });

  // Loading state
  if (!stats) return <DashboardSkeleton />;

  const welcomeMsg = user?.role === 'admin' ? t('welcome_admin') : 
                   user?.role === 'sales_manager' ? `${t('welcome_sales')}, ${user.fullName.split(' ')[0]}` :
                   `${t('welcome_sales')}${user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}`;
  const subtitle = user?.role === 'sales_manager' 
    ? t('dashboard_subtitle_manager')
    : t('dashboard_subtitle_admin');

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ---- Header ---- */}
      <motion.div 
        initial={reduced ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-10"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-card-foreground leading-tight">
            {welcomeMsg}
          </h1>
          <p className="text-muted-foreground font-bold mt-1.5 text-sm md:text-base">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-card px-4 py-2.5 rounded-xl border border-border shadow-sm text-xs font-bold text-muted-foreground flex items-center gap-2">
            <Clock size={14} className="text-indigo-500" />
            {new Date(stats.lastUpdate).toLocaleTimeString(language === 'ar' ? 'ar-DZ' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </motion.div>

      {/* ---- Stats Cards ---- */}
      <motion.div 
        variants={containerVariants}
        initial={reduced ? false : "hidden"}
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        {(user?.role === 'admin' || user?.role === 'sales_manager') && (
          <motion.div variants={itemVariants}>
            <StatsCard 
              icon={DollarSign} 
              color="text-white" 
              bg="bg-indigo-600"
              label={t('total_sales')}
              val={stats.financials.totalRevenue.toLocaleString()}
              unit={t('dzd')}
            />
          </motion.div>
        )}
        {user?.role === 'admin' && (
          <motion.div variants={itemVariants}>
            <StatsCard 
              icon={TrendingUp} 
              color="text-white"
              bg="bg-emerald-500"
              label={t('dashboard_net_profit')} 
              val={stats.financials.totalProfit.toLocaleString()}
              unit={t('dzd')}
            />
          </motion.div>
        )}
        <motion.div variants={itemVariants}>
          <StatsCard 
            icon={Car} 
            color="text-white"
            bg="bg-slate-900"
            label={t('dashboard_available_stock')} 
            val={stats.inventory.available.toString()}
            unit={t('dashboard_unit_car')}
          />
        </motion.div>
        {user?.role === 'admin' && (
          <motion.div variants={itemVariants}>
            <StatsCard 
              icon={Package} 
              color="text-white"
              bg="bg-amber-500"
              label={t('dashboard_stock_value')} 
              val={(stats.financials.stockValue / 1000000).toFixed(1)}
              unit={t('dzd_million')}
            />
          </motion.div>
        )}
      </motion.div>

      {(user?.role === 'admin' || user?.role === 'sales_manager') && (
        <motion.div 
          initial={reduced ? false : "hidden"}
          animate="visible"
          variants={fadeUp}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-card-foreground text-lg flex items-center gap-2">
              <LayoutGrid size={20} className="text-indigo-600" /> {t('dashboard_quick_actions')}
            </h3>
            <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 px-3 py-1.5 rounded-full uppercase tracking-tighter border border-indigo-100 dark:border-indigo-500/20">
              Admin Access Only
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Car, label: t('nav_add_car'), path: '/admin/inventory/add', iconBg: 'bg-indigo-50 dark:bg-indigo-500/10', iconColor: 'text-indigo-600', hoverBg: 'group-hover:bg-indigo-600', borderHover: 'hover:border-indigo-200 dark:hover:border-indigo-500/30' },
              { icon: BookOpen, label: t('nav_bookings'), path: '/admin/bookings', iconBg: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-600', hoverBg: 'group-hover:bg-amber-600', borderHover: 'hover:border-amber-200 dark:hover:border-amber-500/30' },
              { icon: Users, label: t('nav_users'), path: '/admin/users', iconBg: 'bg-purple-50 dark:bg-purple-500/10', iconColor: 'text-purple-600', hoverBg: 'group-hover:bg-purple-600', borderHover: 'hover:border-purple-200 dark:hover:border-purple-500/30' },
              { icon: Wallet, label: t('nav_statistics'), path: '/admin/statistics', iconBg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600', hoverBg: 'group-hover:bg-emerald-600', borderHover: 'hover:border-emerald-200 dark:hover:border-emerald-500/30' },
            ].map(({ icon: Icon, label, path, iconBg, iconColor, hoverBg, borderHover }) => (
              <motion.button
                key={path}
                whileHover={reduced ? {} : { scale: 1.02 }}
                whileTap={reduced ? {} : { scale: 0.97 }}
                onClick={() => navigate(path)}
                className={`p-5 md:p-6 bg-card rounded-3xl border border-border shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 group ${borderHover}`}
              >
                <div className={`w-12 h-12 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center ${hoverBg} group-hover:text-white transition-all duration-300`}>
                  <Icon size={24} />
                </div>
                <span className="font-black text-xs md:text-sm text-muted-foreground group-hover:text-card-foreground transition-colors">{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ---- Chart + Activity Feed ---- */}
      <motion.div 
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {/* Chart */}
        {user?.role !== 'viewer' ? (
          <div className="lg:col-span-2">
            <DashboardChart />
          </div>
        ) : (
          <div className="lg:col-span-2 bg-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-center items-center text-center">
            <Car size={60} className="mb-4 opacity-20" />
            <h3 className="text-2xl font-black mb-2">{t('dashboard_explore_inventory')}</h3>
            <p className="font-bold opacity-80">{t('dashboard_explore_inventory_desc')}</p>
          </div>
        )}

        {/* Activity Feed */}
        <div className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-sm">
          <h3 className="font-black text-card-foreground text-lg mb-6 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" /> {t('dashboard_activity_logs')}
          </h3>
          {latestLogs && latestLogs.length > 0 ? (
            <div className="space-y-6">
              {latestLogs.map((log: Doc<"activity_logs"> & { userName: string }) => (
                <div key={log._id} className={`relative flex gap-4 items-start pb-6 ${isRtl ? 'border-r-2 pr-4' : 'border-l-2 pl-4'} border-border last:border-0 last:pb-0`}>
                  <div className={`absolute ${isRtl ? '-right-2' : '-left-2'} top-0 w-4 h-4 rounded-full bg-card border-4 border-indigo-500`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <p className="text-sm font-black text-card-foreground truncate">{log.userName}</p>
                      <span className="text-[10px] text-muted-foreground font-bold shrink-0 whitespace-nowrap">
                        {timeAgo(log.createdAt, language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      {log.action === "SALE_CREATED" ? t('dashboard_log_sale') : t('dashboard_log_update')}
                      <span className="block text-indigo-600 dark:text-indigo-400 font-bold mt-1">{log.details}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Activity}
              title={t('dashboard_no_activities')}
              description={t('dashboard_no_activities_desc')}
            />
          )}
        </div>
      </motion.div>

      {/* ---- Recent Sales Table ---- */}
      {user?.role !== 'viewer' && (
        <motion.div 
          initial={reduced ? false : "hidden"}
          animate="visible"
          variants={fadeUp}
          className="mt-8 md:mt-10"
        >
          <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-border flex items-center justify-between">
              <h3 className="font-black text-card-foreground text-lg">{t('dashboard_recent_sales')}</h3>
              <button 
                onClick={() => navigate('/admin/sales')}
                className="text-indigo-600 dark:text-indigo-400 text-xs font-black hover:underline flex items-center gap-1"
              >
                {t('dashboard_view_all')} {isRtl ? <ChevronLeft size={14} /> : <ChevronLeft className={`${isRtl ? '' : 'rotate-180'} transition-transform`} size={14} />}
              </button>
            </div>
            {recentSales && recentSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                      <th className="px-6 md:px-8 py-4">{t('dashboard_th_vehicle')}</th>
                      <th className="px-6 md:px-8 py-4">{t('dashboard_th_customer')}</th>
                      <th className="px-6 md:px-8 py-4">{t('dashboard_th_amount')}</th>
                      <th className="px-6 md:px-8 py-4">{t('dashboard_th_date')}</th>
                      <th className="px-6 md:px-8 py-4">{t('dashboard_th_seller')}</th>
                      <th className={`px-6 md:px-8 py-4 ${isRtl ? 'text-left' : 'text-right'}`}>{t('dashboard_th_status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentSales.map((sale: SaleWithDetails) => (
                      <tr key={sale._id} className="hover:bg-muted/30 transition-colors duration-150 group">
                        <td className="px-6 md:px-8 py-4 md:py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                              <Car size={16} />
                            </div>
                            <span className="font-black text-card-foreground text-sm truncate max-w-[140px] md:max-w-none">{sale.carName}</span>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-4 md:py-5 text-sm font-bold text-muted-foreground">{sale.customerName}</td>
                        <td className="px-6 md:px-8 py-4 md:py-5 font-black text-card-foreground tabular-nums text-sm md:text-base whitespace-nowrap">
                          {sale.amountPaid.toLocaleString()} <span className="text-muted-foreground text-xs font-bold">{t('dzd')}</span>
                        </td>
                        <td className="px-6 md:px-8 py-4 md:py-5 text-xs text-muted-foreground font-bold whitespace-nowrap">
                          {new Date(sale.saleDate).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR')}
                        </td>
                        <td className="px-6 md:px-8 py-4 md:py-5 text-sm font-bold text-muted-foreground">{sale.sellerName}</td>
                        <td className={`px-6 md:px-8 py-4 md:py-5 ${isRtl ? 'text-left' : 'text-right'}`}>
                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black border border-emerald-100 dark:border-emerald-500/20">
                            <CheckCircle2 size={12} /> {t('dashboard_status_completed')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState 
                icon={DollarSign}
                title={t('dashboard_no_sales')}
                description={t('dashboard_no_sales_desc')}
              />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
