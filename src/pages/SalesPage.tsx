import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { SaleWithDetails } from '../types/app';
import { Plus, Search, Archive, RotateCcw, Printer, Edit3, Wallet, Users, Target, Car, TrendingUp } from 'lucide-react'; // Added TrendingUp
import InvoiceModal from './InvoiceModal'; 
import SaleFormModal from '../components/SaleFormModal';

const SalesPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  const [currentTab, setCurrentTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null);

  // جلب البيانات الحقيقية من Convex
  // تمرير searchTerm و isArchived إلى الـ Convex query
  const rawSalesData = useQuery(api.sales.getRecentSales, { 
    token, 
    limit: 100,
    searchTerm: searchTerm.toLowerCase().startsWith("inv-") ? searchTerm : undefined, // فقط إذا كان البحث برقم الفاتورة
    isArchived: currentTab === "archived",
  });
  const salesData = useMemo(() => (rawSalesData as SaleWithDetails[]) || [], [rawSalesData]);

  const toggleArchive = useMutation(api.sales.toggleSaleArchive);

  const filteredData = useMemo(() => {
    return salesData.filter((sale: SaleWithDetails) => {
      const isArchived = sale.isArchived || false;
      const matchesTab = currentTab === "active" ? !isArchived : isArchived;
      // Filtering by customerName and carName is done client-side as Convex query doesn't support it directly without denormalization
      const matchesSearch = 
        sale.customerName.includes(searchTerm) || 
        sale.carName.includes(searchTerm) || 
        sale.invoiceNumber.includes(searchTerm);
      return matchesTab && matchesSearch;
    });
  }, [salesData, searchTerm, currentTab]);
  
  const stats = useMemo(() => {
    const total = salesData.reduce((acc: number, curr: SaleWithDetails) => acc + curr.amountPaid, 0);
    const totalProfit = salesData.reduce((acc: number, curr: SaleWithDetails) => acc + (curr.profit || 0), 0);
    
    return [
      { name: 'إجمالي المداخيل', value: `${total.toLocaleString()} دج`, icon: <Wallet className="text-blue-600" />, bg: 'bg-blue-50' },
      { name: 'صافي الأرباح', value: `${totalProfit.toLocaleString()} دج`, icon: <TrendingUp className="text-emerald-600" />, bg: 'bg-emerald-50' },
      { name: 'الزبائن', value: new Set(salesData.map((s: SaleWithDetails) => s.customerName)).size, icon: <Users className="text-purple-600" />, bg: 'bg-purple-50' },
      { name: 'كفاءة البيع', value: '94%', icon: <Target className="text-amber-600" />, bg: 'bg-amber-50' }
    ];
  }, [salesData]);

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans" dir="rtl"> {/* stats is already typed */}
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة المبيعات</h1>
          <p className="text-slate-500 font-bold italic">Motorix Adrar - نظام الفوترة المتطور</p>
        </div>
        <button 
          onClick={() => setIsSaleModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl flex items-center gap-3 font-black shadow-lg shadow-indigo-200 transition-all"
        >
          <Plus size={20} /> إضافة عملية بيع
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className={`${s.bg} p-4 rounded-2xl`}>{s.icon}</div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.name}</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ابحث عن زبون، سيارة أو رقم فاتورة..."
            className="w-full pr-12 pl-4 py-3 bg-white border border-slate-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setCurrentTab("active")} 
            className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${currentTab === "active" ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            العمليات النشطة
          </button>
          <button 
            onClick={() => setCurrentTab("archived")} 
            className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${currentTab === "archived" ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            الأرشيف
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">رقم الفاتورة</th>
                <th className="px-8 py-4">المركبة</th>
                <th className="px-8 py-4">الزبون</th>
                <th className="px-8 py-4">التاريخ</th>
                <th className="px-8 py-4">طريقة الدفع</th>
                <th className="px-8 py-4">المبلغ</th>
                <th className="px-8 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length > 0 ? filteredData.map((sale: SaleWithDetails) => (
                <tr key={sale._id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-5 font-black text-indigo-600 text-sm">{sale.invoiceNumber}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Car size={16} />
                      </div>
                      <span className="font-black text-slate-800">{sale.carName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{sale.customerName}</td>
                  <td className="px-8 py-5 text-xs text-slate-400 font-bold">{new Date(sale.saleDate).toLocaleDateString('ar-DZ')}</td>
                  <td className="px-8 py-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900 tabular-nums">
                    {sale.amountPaid.toLocaleString()} <span className="text-[10px] text-indigo-500 uppercase">دج</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedSale(sale); setIsInvoiceOpen(true); }}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <Printer size={16}/>
                      </button>
                      <button className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all">
                        <Edit3 size={16}/>
                      </button>
                      <button 
                        onClick={() => toggleArchive({ token, saleId: sale._id })}
                        className={`p-2 rounded-xl transition-all ${sale.isArchived ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white'}`}
                      >
                        {sale.isArchived ? <RotateCcw size={16}/> : <Archive size={16}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="p-20 text-center text-slate-400 font-bold">لا توجد نتائج تطابق بحثك..</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} sale={selectedSale} />
      
      {/* Sale Form Modal */}
      <SaleFormModal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} />
    </div>
  );
};

export default SalesPage;