import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SaleWithDetails } from '../types/app';
import { Id } from '../../convex/_generated/dataModel';
import { Plus, Search, Archive, RotateCcw, Printer, Edit3, Wallet, Users, Target, Car, TrendingUp, Truck } from 'lucide-react'; 
import { toast } from 'react-hot-toast';
import InvoiceClassic from '../components/InvoiceClassic'; 
import SaleFormModal from '../components/SaleFormModal';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/sales/ar.json';
import en from '../lib/i18n/pages/sales/en.json';
import fr from '../lib/i18n/pages/sales/fr.json';

const SalesPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  const [currentTab, setCurrentTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = usePageTranslation({ ar, en, fr });
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null);

  // جلب البيانات الحقيقية من Convex
  // تمرير searchTerm و isArchived إلى الـ Convex query
  const rawSalesData = useQuery(api.sales.getRecentSales, { 
    token, 
    limit: 100,
    searchTerm: searchTerm, // Pass searchTerm directly to backend
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

  const filteredData = salesData; // No client-side filtering needed now
  
  const stats = useMemo(() => {
    const total = salesData.reduce((acc: number, curr: SaleWithDetails) => acc + curr.amountPaid, 0);
    const totalProfit = salesData.reduce((acc: number, curr: SaleWithDetails) => acc + (curr.profit || 0), 0);
    
    return [
      { name: t('stats_total_revenue'), value: `${total.toLocaleString()} دج`, icon: <Wallet className="text-blue-600" />, bg: 'bg-blue-50' },
      { name: t('stats_net_profit'), value: `${totalProfit.toLocaleString()} دج`, icon: <TrendingUp className="text-emerald-600" />, bg: 'bg-emerald-50' },
      { name: t('stats_customers'), value: new Set(salesData.map((s: SaleWithDetails) => s.customerName)).size, icon: <Users className="text-purple-600" />, bg: 'bg-purple-50' },
      { name: t('stats_efficiency'), value: '94%', icon: <Target className="text-amber-600" />, bg: 'bg-amber-50' }
    ];
  }, [salesData]);

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-slate-950 p-8 font-sans transition-colors duration-300" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('page_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold italic">{t('page_subtitle')}</p>
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
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-5 transition-all hover:shadow-md dark:hover:shadow-slate-950/40">
            <div className={`${s.bg} dark:bg-slate-800/60 p-4 rounded-2xl`}>{s.icon}</div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.name}</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            className="w-full pr-12 pl-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-800 dark:text-white rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <button 
            onClick={() => setCurrentTab("active")} 
            className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${currentTab === "active" ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            {t('tab_active')}
          </button>
          <button 
            onClick={() => setCurrentTab("archived")} 
            className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${currentTab === "archived" ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            {t('tab_archived')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
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
            <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
              {filteredData.length > 0 ? filteredData.map((sale: SaleWithDetails) => (
                <tr key={sale._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all group">
                  <td className="px-8 py-5 font-black text-indigo-600 dark:text-indigo-400 text-sm">{sale.invoiceNumber}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-450">
                        <Car size={16} />
                      </div>
                      <span className="font-black text-slate-800 dark:text-slate-200">{sale.carName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600 dark:text-slate-400">{sale.customerName}</td>
                  <td className="px-8 py-5 text-xs text-slate-400 dark:text-slate-500 font-bold">{new Date(sale.saleDate).toLocaleDateString('ar-DZ')}</td>
                  <td className="px-8 py-5">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg text-[10px] font-black">
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
                      className="bg-slate-50 dark:bg-slate-800 border-none text-[10px] font-black rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer text-slate-600 dark:text-slate-300"
                    >
                      <option value="processed">{t('delivery_processed')}</option>
                      <option value="quality_check">{t('delivery_quality')}</option>
                      <option value="shipped">{t('delivery_shipped')}</option>
                      <option value="delivered">{t('delivery_delivered')}</option>
                    </select>
                    <div className="mt-1 flex items-center gap-1 opacity-40 dark:opacity-60">
                       <Truck size={10} className="text-slate-500 dark:text-slate-400" />
                       <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">{t('delivery_tracking')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900 dark:text-white tabular-nums">
                    {sale.amountPaid.toLocaleString()} <span className="text-[10px] text-indigo-500 dark:text-indigo-400 uppercase">دج</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedSale(sale); setIsInvoiceOpen(true); }}
                        className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all cursor-pointer shadow-sm"
                      >
                        <Printer size={16}/>
                      </button>
                      <button className="p-2 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-600 hover:text-white dark:hover:bg-amber-500 transition-all cursor-pointer shadow-sm">
                        <Edit3 size={16}/>
                      </button>
                      <button 
                        onClick={() => toggleArchive({ token, saleId: sale._id })}
                        className={`p-2 rounded-xl transition-all cursor-pointer shadow-sm ${sale.isArchived ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-450' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-450 hover:bg-purple-600 hover:text-white'}`}
                      >
                        {sale.isArchived ? <RotateCcw size={16}/> : <Archive size={16}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="p-20 text-center text-slate-400 dark:text-slate-600 font-bold">{t('no_results')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceClassic isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} sale={selectedSale} />
      
      {/* Sale Form Modal */}
      <SaleFormModal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} key={selectedSale?._id || 'new-sale'} />
    </div>
  );
};

export default SalesPage;