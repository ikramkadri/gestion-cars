import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SaleWithDetails } from '../types/app';
import { Id } from '../../convex/_generated/dataModel';
import { Plus, Search, Archive, RotateCcw, Printer, Edit3, Wallet, Users, Target, Car, TrendingUp, Truck } from 'lucide-react'; 
import { toast } from 'react-hot-toast';
import InvoiceClassic from '../components/InvoiceClassic'; 
import SaleFormModal from '../components/SaleFormModal';
import StatsCard from '../components/StatsCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/sales/ar.json';
import en from '../lib/i18n/pages/sales/en.json';
import fr from '../lib/i18n/pages/sales/fr.json';

const PAYMENT_COLORS: Record<string, string> = {
  'نقداً': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  'كاش': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  'CASH': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  'تحويل': 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  'بطاقة': 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
  'CARTE': 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
};

const getPaymentColor = (method?: string) => {
  if (!method) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  return PAYMENT_COLORS[method] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
};

const SalesPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  const [currentTab, setCurrentTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = usePageTranslation({ ar, en, fr });
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: 'destructive' | 'warning' | 'info';
    confirmLabel: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', variant: 'info', confirmLabel: '', onConfirm: () => {} });
  const showConfirm = (opts: { title: string; description: string; variant?: 'destructive' | 'warning' | 'info'; confirmLabel?: string; onConfirm: () => void }) =>
    setConfirmDialog({ open: true, ...opts, variant: opts.variant || 'info', confirmLabel: opts.confirmLabel || 'Confirm' });

  // Fetch data from Convex
  const rawSalesData = useQuery(api.sales.getRecentSales, { 
    token, 
    limit: 100,
    searchTerm: searchTerm,
    isArchived: currentTab === "archived",
  });
  const salesData = useMemo(() => (rawSalesData as SaleWithDetails[]) || [], [rawSalesData]);

  const toggleArchive = useMutation(api.sales.toggleSaleArchive);
  const updateDelivery = useMutation(api.sales.updateDeliveryStatus);

  const handleUpdateDelivery = async (
    saleId: Id<"sales">, 
    status: "processed" | "quality_check" | "shipped" | "delivered"
  ) => {
    try {
      await updateDelivery({ token, saleId, status });
      toast.success(t('update_delivery_success'));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('update_delivery_error'));
    }
  };

  const handleToggleArchive = (sale: SaleWithDetails) => {
    const archiving = !sale.isArchived;
    showConfirm({
      title: archiving ? t('archive_title') : t('unarchive_title'),
      description: archiving ? t('archive_confirm') : t('unarchive_confirm'),
      variant: 'warning',
      confirmLabel: archiving ? (t('archive_button') || 'Archive') : (t('unarchive_button') || 'Unarchive'),
      onConfirm: async () => {
        try {
          await toggleArchive({ token, saleId: sale._id });
          toast.success(archiving ? t('archive_success') : t('unarchive_success'));
        } catch {
          toast.error(t('archive_error'));
        }
      },
    });
  };

  const filteredData = salesData;
  
  const stats = useMemo(() => {
    const total = salesData.reduce((acc: number, curr: SaleWithDetails) => acc + curr.amountPaid, 0);
    const totalProfit = salesData.reduce((acc: number, curr: SaleWithDetails) => acc + (curr.profit || 0), 0);
    
    return [
      { name: t('stats_total_revenue'), value: `${total.toLocaleString()} دج`, icon: Wallet, bg: 'bg-blue-600', color: 'text-white' },
      { name: t('stats_net_profit'), value: `${totalProfit.toLocaleString()} دج`, icon: TrendingUp, bg: 'bg-emerald-500', color: 'text-white' },
      { name: t('stats_customers'), value: new Set(salesData.map((s: SaleWithDetails) => s.customerName)).size, icon: Users, bg: 'bg-purple-600', color: 'text-white' },
      { name: t('stats_efficiency'), value: '94%', icon: Target, bg: 'bg-amber-500', color: 'text-white' }
    ];
  }, [salesData]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans transition-colors duration-300" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-foreground">{t('page_title')}</h1>
          <p className="text-muted-foreground font-bold italic">{t('page_subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsSaleModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl flex items-center gap-3 font-black shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
        >
          <Plus size={20} /> {t('add_sale')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((s, i) => (
          <StatsCard key={i} label={s.name} val={s.value} unit="" icon={s.icon} bg={s.bg} color={s.color} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            className="w-full pr-12 pl-4 py-3 bg-card border-border text-foreground rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex bg-card p-1.5 rounded-2xl border border-border shadow-sm">
          <button 
            onClick={() => setCurrentTab("active")} 
            className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${currentTab === "active" ? 'bg-indigo-600 text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('tab_active')}
          </button>
          <button 
            onClick={() => setCurrentTab("archived")} 
            className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${currentTab === "archived" ? 'bg-amber-500 text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t('tab_archived')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-[2.5rem] shadow-sm border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">{t('th_invoice')}</th>
                <th className="px-8 py-4">{t('th_vehicle')}</th>
                <th className="px-8 py-4">{t('th_customer')}</th>
                <th className="px-8 py-4">{t('th_date')}</th>
                <th className="px-8 py-4">{t('th_payment')}</th>
                <th className="px-8 py-4">{t('th_delivery')}</th>
                <th className="px-8 py-4">{t('th_amount')}</th>
                <th className="px-8 py-4 text-center">{t('th_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length > 0 ? filteredData.map((sale: SaleWithDetails) => (
                <tr key={sale._id} className="hover:bg-muted/30 transition-all group">
                  <td className="px-8 py-5 font-black text-indigo-600 dark:text-indigo-400 text-sm">{sale.invoiceNumber}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Car size={16} />
                      </div>
                      <span className="font-black text-foreground">{sale.carName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-muted-foreground">{sale.customerName}</td>
                  <td className="px-8 py-5 text-xs text-muted-foreground font-bold">{new Date(sale.saleDate).toLocaleDateString('ar-DZ')}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${getPaymentColor(sale.paymentMethod)}`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <select 
                      value={sale.deliveryStatus || 'processed'}
                      onChange={(e) => handleUpdateDelivery(
                        sale._id, 
                        e.target.value as "processed" | "quality_check" | "shipped" | "delivered"
                      )}
                      className="bg-muted border-none text-[10px] font-black rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-foreground"
                    >
                      <option value="processed">{t('delivery_processed')}</option>
                      <option value="quality_check">{t('delivery_quality')}</option>
                      <option value="shipped">{t('delivery_shipped')}</option>
                      <option value="delivered">{t('delivery_delivered')}</option>
                    </select>
                    <div className="mt-1 flex items-center gap-1 opacity-40">
                       <Truck size={10} className="text-muted-foreground" />
                       <span className="text-[8px] font-bold text-muted-foreground">{t('delivery_tracking')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-foreground tabular-nums">
                    {sale.amountPaid.toLocaleString()} <span className="text-[10px] text-indigo-500 dark:text-indigo-400 uppercase">دج</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedSale(sale); setIsInvoiceOpen(true); }}
                        aria-label={t('print_invoice') || 'Print invoice'}
                        className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all cursor-pointer shadow-sm"
                      >
                        <Printer size={16}/>
                      </button>
                      <button 
                        aria-label={t('edit_sale') || 'Edit sale'}
                        className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-600 hover:text-white dark:hover:bg-amber-500 transition-all cursor-pointer shadow-sm"
                      >
                        <Edit3 size={16}/>
                      </button>
                      <button 
                        onClick={() => handleToggleArchive(sale)}
                        aria-label={sale.isArchived ? (t('unarchive_sale') || 'Unarchive sale') : (t('archive_sale') || 'Archive sale')}
                        className={`p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl transition-all cursor-pointer shadow-sm ${
                          sale.isArchived 
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white'
                        }`}
                      >
                        {sale.isArchived ? <RotateCcw size={16}/> : <Archive size={16}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="p-20 text-center text-muted-foreground font-bold">{t('no_results')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* Invoice Modal */}
      <InvoiceClassic isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} sale={selectedSale} />
      
      {/* Sale Form Modal */}
      <SaleFormModal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} key={selectedSale?._id || 'new-sale'} />
    </div>
  );
};

export default SalesPage;
