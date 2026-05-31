import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SaleWithDetails } from '../types/app';
import { Search, Printer, FileText, Calendar, User, Car as CarIcon, Loader2, DollarSign, Receipt, TrendingUp } from 'lucide-react';
import InvoiceClassic from '../components/InvoiceClassic';
import StatsCard from '../components/StatsCard';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/invoices/ar.json';
import en from '../lib/i18n/pages/invoices/en.json';
import fr from '../lib/i18n/pages/invoices/fr.json';

const InvoicesPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const { t } = usePageTranslation({ ar, en, fr });

  const salesData = useQuery(api.sales.getRecentSales, { 
    token, 
    limit: 200,
    searchTerm: searchTerm,
    isArchived: false,
  }) as SaleWithDetails[] | undefined;

  const filteredInvoices = salesData || [];

  // Stats summary
  const stats = useMemo(() => {
    const data = filteredInvoices;
    const totalRevenue = data.reduce((acc, curr) => acc + curr.amountPaid, 0);
    const thisMonth = data.filter(inv => {
      const date = new Date(inv.saleDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const monthlyRevenue = thisMonth.reduce((acc, curr) => acc + curr.amountPaid, 0);
    return [
      { label: t('stats_total_invoices'), value: data.length, icon: Receipt, bg: 'bg-indigo-600', color: 'text-white' },
      { label: t('stats_total_revenue'), value: `${totalRevenue.toLocaleString()}`, icon: DollarSign, bg: 'bg-emerald-500', color: 'text-white' },
      { label: t('stats_monthly'), value: `${monthlyRevenue.toLocaleString()}`, icon: TrendingUp, bg: 'bg-amber-500', color: 'text-white' },
    ];
  }, [filteredInvoices]);

  if (salesData === undefined) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans text-right transition-colors duration-300" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
          <FileText className="text-pink-500" size={32} /> {t('page_title')}
        </h1>
        <p className="text-muted-foreground font-bold italic">{t('page_subtitle')}</p>
      </div>

      {/* IN2: Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((s, i) => (
          <StatsCard key={i} label={s.label} val={s.value} unit="" icon={s.icon} bg={s.bg} color={s.color} />
        ))}
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input 
          type="text" 
          placeholder={t('search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-12 pl-4 py-3 bg-card border-border text-foreground rounded-2xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-pink-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvoices.length > 0 ? filteredInvoices.map((invoice: SaleWithDetails) => (
          <div 
            key={invoice._id} 
            className="bg-card rounded-[2rem] p-6 shadow-sm border-border hover:shadow-md transition-all group cursor-pointer"
            onClick={() => { setSelectedSale(invoice); setIsInvoiceOpen(true); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedSale(invoice); setIsInvoiceOpen(true); } }}
            tabIndex={0}
            role="button"
            aria-label={`${t('view_invoice') || 'View invoice'} ${invoice.invoiceNumber}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                {invoice.invoiceNumber}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedSale(invoice); setIsInvoiceOpen(true); }}
                aria-label={t('print_invoice') || 'Print invoice'}
                className="p-2 bg-muted text-muted-foreground hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
              >
                <Printer size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">{t('label_customer')}</p>
                  <p className="text-sm font-black text-card-foreground">{invoice.customerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <CarIcon size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">{t('label_vehicle')}</p>
                  <p className="text-sm font-black text-card-foreground">{invoice.carName}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold">
                  <Calendar size={14} />
                  {new Date(invoice.saleDate).toLocaleDateString('ar-DZ')}
                </div>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {invoice.amountPaid.toLocaleString()} <small className="text-[10px]">دج</small>
                </div>
              </div>
            </div>
          </div>
        )) : (
          // IN4: Enhanced empty state
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
              <Receipt size={28} className="text-muted-foreground/60" />
            </div>
            <p className="text-sm font-black text-card-foreground mb-1">{t('no_results')}</p>
            <p className="text-xs font-medium text-muted-foreground max-w-[240px] mx-auto">
              {searchTerm ? t('no_results_search') || 'Try a different search term' : t('no_results_initial') || 'No invoices recorded yet'}
            </p>
          </div>
        )}
      </div>

      <InvoiceClassic 
        isOpen={isInvoiceOpen} 
        onClose={() => setIsInvoiceOpen(false)} 
        sale={selectedSale} 
      />
    </div>
  );
};

export default InvoicesPage;
