import { useState } from 'react';
import { Printer, Car, Loader2, Send, Download } from 'lucide-react';
import { SaleWithDetails } from '../types/app';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';
// The @ts-expect-error directive is no longer needed as html2pdf.js types are now recognized.
import html2pdf from 'html2pdf.js';

interface InvoiceClassicProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleWithDetails | null;
  settings: {
    showroomName?: string;
    contactPhone?: string;
    address?: string;
    logoImageUrl?: string; // Assuming logoImageUrl will be passed
  } | null | undefined;
}

const InvoiceClassic = ({ isOpen, onClose, sale, settings }: InvoiceClassicProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // بيانات افتراضية في حال عدم توفرها للمعاينة
  const defaultSale = sale || {
    invoiceNumber: "INV-001",
    saleDate: new Date().toISOString(),
    customerName: "محمد بن علي",
    phone: "0550 12 34 56",
    email: "customer@example.com",
    address: "حي الدار البيضاء، الجزائر",
    identityNum: "123456789", // Added for completeness
    carName: "Mercedes-Benz G63 AMG",
    subtotal: 28000000,
    taxAmount: 5320000,
    registrationFees: 0, // Added for completeness
    amountPaid: 33320000,
    vin: "W1NAG7GF8LA123456",
    paymentMethod: "Cash", // Added for completeness
    sellerName: "موظف", // Added for completeness
    mileageAtSale: 0, // Added for completeness
  };

  const defaultSettings = settings || {
    showroomName: "MOTORIX",
    contactPhone: "021 00 00 00",
    address: "الجزائر العاصمة",
    logoImageUrl: undefined, // Default logo
  };

  if (!isOpen) return null;

  const handleSendEmail = async () => {
    // تم تحسين التحقق من النوع هنا لتجنب استخدام any
    const customerEmail = sale?.email || (sale as SaleWithDetails & { customerEmail?: string })?.customerEmail;
    if (!customerEmail) {
      return toast.error("بريد الزبون غير مسجل، لا يمكن الإرسال.");
    }

    setIsSending(true);
    const toastId = toast.loading("جاري تحويل الفاتورة إلى PDF وإرسالها...");

    try {
      // 1. تحديد عنصر الفاتورة من الـ DOM
      const element = document.getElementById('printable-invoice');
      if (!element) throw new Error("لم يتم العثور على محتوى الفاتورة");

      // 2. إعدادات تحويل الـ PDF
      const opt = {
        margin:       10, // تم التعديل: يمكن أن تكون رقماً واحداً لجميع الهوامش أو مصفوفة بأربعة عناصر [top, right, bottom, left]
        filename:     `Invoice-${defaultSale.invoiceNumber}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      // 3. تحويل الـ HTML إلى PDF بصيغة Data URI (Base64)
      // هذه العملية قد تستغرق ثانية أو ثانيتين
      const pdfBase64 = await html2pdf().from(element).set(opt).outputPdf('datauristring');

      // 4. إرسال الإيميل مع الملف المرفق
      await emailjs.send(
        'YOUR_SERVICE_ID', 
        'YOUR_TEMPLATE_ID', 
        {
          to_name: defaultSale.customerName,
          to_email: customerEmail,
          invoice_number: defaultSale.invoiceNumber,
          car_name: defaultSale.carName,
          total_amount: defaultSale.amountPaid?.toLocaleString() + " دج",
          showroom_name: defaultSettings.showroomName,
          reply_to: defaultSettings.contactPhone,
          // هذا المتغير يجب ربطه في إعدادات EmailJS كـ Attachment
          invoice_pdf: pdfBase64, 
        },
        'YOUR_PUBLIC_KEY'
      );
      toast.success("تم إرسال الفاتورة كملف PDF بنجاح 📧", { id: toastId });
    } catch (error) {
      toast.error("فشل في تحويل أو إرسال الفاتورة.", { id: toastId }); // error is implicitly any
      console.error("EmailJS Error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) return;

    setIsGenerating(true);
    const toastId = toast.loading("جاري تجهيز ملف PDF...");

    try {
      const opt = {
        margin:       10,
        filename:     `Invoice-${defaultSale.invoiceNumber}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().from(element).set(opt).save();
      toast.success("تم تحميل الفاتورة بنجاح ✅", { id: toastId });
    } catch (error: unknown) {
      toast.error("حدث خطأ أثناء تحميل الملف", { id: toastId }); // error is implicitly any
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-[800px] rounded-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[98vh]">
        
        {/* الجسم القابل للطباعة */}
        <div className="overflow-y-auto p-12 print:p-8" id="printable-invoice" dir="rtl">
          
          {/* 1. Header: Word "Invoice" & Logo */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-6xl font-light text-gray-200 uppercase tracking-widest print:text-gray-400">فاتورة</h1>
            <div className="flex flex-col items-center">
               {defaultSettings.logoImageUrl ? (
                 <img src={defaultSettings.logoImageUrl} alt="Logo" className="w-16 h-16 object-contain mb-2" />
               ) : (
                 <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mb-2">
                   <Car size={32} />
                 </div>
               )}
               <span className="font-black text-xl tracking-tighter uppercase">{defaultSettings.showroomName}</span>
            </div>
          </div>

          {/* 2. Addresses & Invoice Info Grid */}
          <div className="grid grid-cols-2 gap-10 mb-12">
            {/* الجهة اليمنى: بيانات البائع والمشتري */}
            <div className="space-y-8">
              <div>
                <h5 className="text-gray-400 font-black text-xs uppercase mb-2">من:</h5>
                <p className="font-black text-gray-900">{defaultSettings.showroomName}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{defaultSettings.address}</p>
                <p className="text-sm text-gray-500">{defaultSettings.contactPhone}</p>
              </div>
              <div>
                <h5 className="text-gray-400 font-black text-xs uppercase mb-2">إلى: (بيانات المشتري)</h5>
                <p className="font-black text-gray-900 text-lg">{defaultSale.customerName}</p>
                <p className="text-sm text-gray-500">{defaultSale.address || 'غير مسجل'}</p>
                <p className="text-sm text-gray-500 font-mono">{defaultSale.phone}</p>
                {defaultSale.identityNum && <p className="text-sm text-gray-500">رقم الهوية: {defaultSale.identityNum}</p>}
              </div>
            </div>

            {/* الجهة اليسرى: أرقام الفاتورة */}
            <div className="flex justify-end text-left" dir="ltr">
              <div className="space-y-2">
                <div className="flex gap-4">
                  <span className="text-gray-400 font-black text-xs uppercase w-32 text-right">رقم الفاتورة:</span>
                  <span className="font-bold text-gray-900">{defaultSale.invoiceNumber}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-400 font-black text-xs uppercase w-32 text-right">التاريخ:</span>
                  <span className="font-bold text-gray-900">{new Date(defaultSale.saleDate).toLocaleDateString('ar-DZ')}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-400 font-black text-xs uppercase w-32 text-right">رقم الهيكل:</span>
                  <span className="font-mono text-gray-900">{defaultSale.vin || '---'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. The Items Table */}
          <div className="mb-10">
            <table className="w-full border-t-2 border-b-2 border-gray-900">
              <thead>
                <tr className="text-gray-400 text-xs font-black uppercase text-right">
                  <th className="py-4 pr-2">الكمية</th>
                  <th className="py-4">الوصف</th>
                  <th className="py-4 text-left pl-2">السعر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="text-gray-900 font-bold">
                  <td className="py-6 pr-2">01</td>
                  <td className="py-6 text-lg">{defaultSale.carName}</td>
                  <td className="py-6 text-left pl-2 font-mono">{defaultSale.subtotal?.toLocaleString()} دج</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. Totals & Signature */}
          <div className="flex justify-between items-start">
            {/* التوقيع */}
            <div className="mt-10">
               <div className="text-center">
                 {/* خط توقيع يحاكي الصورة */}
                 <p className="text-3xl font-serif italic text-gray-800 mb-0 opacity-80" style={{fontFamily: 'cursive'}}>Signature</p>
                 <div className="w-48 h-px bg-gray-300 mt-2"></div>
                 <p className="text-[10px] font-black text-gray-400 uppercase mt-2">ختم وتوقيع الإدارة</p>
               </div>
            </div>

            {/* الحسابات */}
            <div className="w-64 space-y-3 pt-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>المجموع الفرعي:</span>
                <span className="font-mono">{defaultSale.subtotal?.toLocaleString()} دج</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 italic">
                <span>الضريبة (19%):</span>
                <span className="font-mono">{defaultSale.taxAmount?.toLocaleString()} دج</span>
              </div>
              {defaultSale.registrationFees > 0 && (
                <div className="flex justify-between text-sm text-gray-500 italic">
                  <span>رسوم التسجيل:</span>
                  <span className="font-mono">{defaultSale.registrationFees?.toLocaleString()} دج</span>
                </div>
              )}
              {/* المربع الكبير للإجمالي كما في الصورة */}
              <div className="border-t-4 border-gray-900 pt-4 mt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-black uppercase">الإجمالي:</span>
                  <span className="text-3xl font-black text-gray-900 tabular-nums font-mono">
                    {defaultSale.amountPaid?.toLocaleString()} دج
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Terms & Conditions */}
          <div className="mt-20 border-t border-gray-100 pt-8 text-right">
            <h6 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">الشروط والأحكام:</h6>
            <ul className="text-[10px] text-gray-400 space-y-1 font-bold">
              <li>• يتم تسليم المركبة فور التأكد من وصول المبلغ كاملاً للحساب البنكي.</li>
              <li>• الضمان يشمل المحرك وعلبة السرعة لمدة 6 أشهر من تاريخ البيع.</li>
              <li>• تخضع هذه الفاتورة للقوانين التجارية للجمهورية الجزائرية الديمقراطية الشعبية.</li>
            </ul>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="p-6 bg-slate-50 border-t flex justify-center gap-4 print:hidden">
          <button 
            onClick={() => window.print()}
            className="bg-slate-900 text-white px-10 py-3 rounded-full font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl"
          >
            <Printer size={18}/> طباعة الفاتورة
          </button>
          <button 
            disabled={isGenerating}
            onClick={handleDownloadPDF}
            className="bg-blue-600 text-white px-10 py-3 rounded-full font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18}/>}
            حفظ كـ PDF
          </button>
          <button 
            disabled={isSending}
            onClick={handleSendEmail}
            className="bg-emerald-600 text-white px-10 py-3 rounded-full font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl disabled:opacity-50"
          >
            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18}/>}
            إرسال بالإيميل
          </button>
          <button 
            onClick={onClose}
            className="bg-white border border-gray-200 text-gray-500 px-10 py-3 rounded-full font-black hover:bg-gray-100"
          >
            إلغلاق
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          /* 1. إخفاء كل شيء في الصفحة */
          body { 
            visibility: hidden; 
            background: white !important; 
          }
          
          /* 2. إظهار الحاوية الرئيسية للمودال والفاتورة فقط */
          .fixed.inset-0, 
          .bg-white.w-full, 
          #printable-invoice, 
          #printable-invoice * { 
            visibility: visible !important; 
          }

          /* 3. إلغاء تأثيرات المودال (الخلفية السوداء والشفافية) لكي لا تظهر في الطباعة */
          .fixed.inset-0 { 
            position: absolute !important; 
            background: white !important; 
            backdrop-filter: none !important; 
          }

          /* 4. تمديد الفاتورة لتأخذ كامل الصفحة */
          .bg-white.w-full {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
          }

          /* 5. إخفاء الأزرار نهائياً */
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default InvoiceClassic;