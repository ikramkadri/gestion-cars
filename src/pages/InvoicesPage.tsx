import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SaleWithDetails } from '../types/app';
import { Search, Printer, FileText, Calendar, User, Car as CarIcon, Loader2 } from 'lucide-react';
import InvoiceClassic from '../components/InvoiceClassic';
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

  // جلب كافة المبيعات المسجلة كفواتير
  // تمرير searchTerm إلى الـ Convex query
  const salesData = useQuery(api.sales.getRecentSales, { 
    token, 
    limit: 200,
    searchTerm: searchTerm, // Pass searchTerm directly to backend
    isArchived: false, // الفواتير النشطة فقط
  }) as SaleWithDetails[] | undefined;

  const filteredInvoices = salesData || []; // Ensure it's an array

  if (salesData === undefined) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD] dark:bg-slate-950">
      <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-slate-950 p-8 font-sans text-right transition-colors duration-300" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <FileText className="text-pink-500" size={32} /> {t('page_title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold italic">{t('page_subtitle')}</p>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder={t('search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-12 pl-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-800 dark:text-white rounded-2xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvoices.map((invoice: SaleWithDetails) => (
          <div key={invoice._id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md dark:hover:shadow-slate-950/40 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                {invoice.invoiceNumber}
              </div>
              <button 
                onClick={() => { setSelectedSale(invoice); setIsInvoiceOpen(true); }}
                className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white rounded-xl transition-all"
              >
                <Printer size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{t('label_customer')}</p>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">{invoice.customerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <CarIcon size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{t('label_vehicle')}</p>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200">{invoice.carName}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold">
                  <Calendar size={14} />
                  {new Date(invoice.saleDate).toLocaleDateString('ar-DZ')}
                </div>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {invoice.amountPaid.toLocaleString()} <small className="text-[10px]">دج</small>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-350 dark:text-slate-500 font-bold italic">
            {t('no_results')}
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