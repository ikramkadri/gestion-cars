import { useState } from 'react';
import { Printer, Car, Loader2, Download, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { SaleWithDetails } from '../types/app';

interface InvoiceClassicProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleWithDetails | null;
}

const InvoiceClassic = ({ isOpen, onClose, sale }: InvoiceClassicProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // جلب إعدادات المعرض والشعار مباشرة
  const settings = useQuery(api.site_settings.getSettings);
  const logoImageUrl = useQuery(
    api.files.getImageUrl,
    settings?.logoImageId ? { storageId: settings.logoImageId as Id<"_storage"> } : "skip"
  );

  // بيانات افتراضية للمعاينة
  const defaultSale = sale || {
    invoiceNumber: "INV-0000",
    saleDate: Date.now(),
    customerName: "زبون غير مسجل",
    phone: "---",
    address: "---",
    carName: "مركبة غير محددة",
    amountPaid: 0,
    vin: "---",
  };

  const showroomName = settings?.showroomName || "MOTORIX";

  // حسابات الضريبة (19% المعيار الجزائري)
  const totalPaid = defaultSale.amountPaid || 0;
  const subtotal = Math.round(totalPaid / 1.19);
  const tax = totalPaid - subtotal;

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) return;

    setIsGenerating(true);
    const html2pdf = (await import('html2pdf.js')).default; // Dynamic import here
    const toastId = toast.loading("جاري تجهيز ملف PDF...");

    try {
      const opt = {
        margin: 10,
        filename: `Invoice-${defaultSale.invoiceNumber}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      await html2pdf().from(element).set(opt).save();
      toast.success("تم الحفظ بنجاح", { id: toastId });
    } catch {
      toast.error("حدث خطأ أثناء التحميل", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[850px] rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[98vh] animate-in zoom-in-95 duration-300">
        
        <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-full transition-all z-10 print:hidden">
          <X size={20} />
        </button>

        <div className="overflow-y-auto p-12 print:p-8" id="printable-invoice" dir="rtl">
          {/* Header */}
          <div className="flex justify-between items-center mb-12 border-b-4 border-slate-900 pb-8">
            <div className="flex flex-col items-start">
               <div className="flex items-center gap-3 mb-2">
                  {logoImageUrl ? (
                    <img src={logoImageUrl} alt="Logo" className="w-16 h-16 object-contain" />
                  ) : (
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                      <Car size={32} />
                    </div>
                  )}
                  <span className="font-black text-3xl tracking-tighter uppercase text-slate-900">{showroomName}</span>
               </div>
            </div>
            <div className="text-left" dir="ltr">
               <p className="text-4xl font-black text-slate-900 mb-1">{defaultSale.invoiceNumber}</p>
               <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Invoice Ref</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-16 mb-16">
            <div className="space-y-6">
              <div>
                <h5 className="text-blue-600 font-black text-[10px] uppercase mb-2">جهة الإصدار</h5>
                <p className="font-black text-slate-900">{showroomName}</p>
                <p className="text-sm text-slate-500">{settings?.address || "الجزائر"}</p>
              </div>
              <div>
                <h5 className="text-blue-600 font-black text-[10px] uppercase mb-2">المشتري</h5>
                <p className="font-black text-slate-900 text-xl">{defaultSale.customerName}</p>
                <p className="text-sm text-slate-500 font-black">{defaultSale.phone}</p>
              </div>
            </div>
            <div className="flex flex-col justify-end text-left font-bold" dir="ltr">
               <p className="text-xs text-slate-400">DATE: {new Date(defaultSale.saleDate).toLocaleDateString('ar-DZ')}</p>
               <p className="text-xs text-slate-400 uppercase">VIN: {defaultSale.vin}</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-t-4 border-slate-900 mb-12">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase text-right tracking-widest">
                <th className="py-6">الوصف</th>
                <th className="py-6 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              <tr className="text-slate-900 font-black">
                <td className="py-8">
                  <p className="text-2xl">{defaultSale.carName}</p>
                  <p className="text-[10px] text-slate-400 italic">سند ملكية مؤقت - مركبة مضمونة</p>
                </td>
                <td className="py-8 text-left text-2xl">{subtotal.toLocaleString()} دج</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-between items-start">
            <div className="border-r-4 border-emerald-500 pr-6 mt-8">
              <p className="text-2xl font-serif italic text-slate-900 opacity-90" style={{fontFamily: 'cursive'}}>Motorix Management</p>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-2">ختم وتوقيع الإدارة</p>
            </div>
            <div className="w-80 space-y-4 bg-slate-50 p-8 rounded-[2.5rem]">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                <span>المجموع الصافي:</span>
                <span>{subtotal.toLocaleString()} دج</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                <span>الضريبة (19%):</span>
                <span>{tax.toLocaleString()} دج</span>
              </div>
              <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Amount - الإجمالي</span>
                <span className="text-4xl font-black text-slate-900 tabular-nums">
                  {totalPaid.toLocaleString()} <small className="text-sm">دج</small>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 bg-slate-50 border-t flex justify-center gap-4 print:hidden">
          <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95">
            <Printer size={20}/> طباعة
          </button>
          <button disabled={isGenerating} onClick={handleDownloadPDF} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50 active:scale-95">
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20}/>}
            تحميل PDF
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 0 !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default InvoiceClassic;