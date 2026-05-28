import { motion } from 'framer-motion';
import { Truck, ShieldCheck, FileText, MapPin, CheckCircle2, X, MessageSquare } from 'lucide-react';
import { SaleWithDetails } from '../types/app';

interface DeliveryTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleWithDetails | null;
}

const steps = [
  { id: 'processed', label: 'تجهيز الوثائق', desc: 'تم إصدار الفاتورة وتجهيز ملف الملكية النهائي.', icon: FileText },
  { id: 'quality_check', label: 'فحص الجودة', desc: 'نقوم بإجراء فحص تقني أخير وسوائل السيارة قبل الشحن.', icon: ShieldCheck },
  { id: 'shipped', label: 'في الطريق', desc: 'السيارة الآن على متن شاحنة النقل المتجهة لعنوانك.', icon: Truck },
  { id: 'delivered', label: 'تم التسليم', desc: 'مبروك! السيارة في عهدتك الآن. قيادة ممتعة!', icon: MapPin },
];

const DeliveryTrackerModal = ({ isOpen, onClose, sale }: DeliveryTrackerModalProps) => {
  if (!isOpen || !sale) return null;

  const currentStatus = sale.deliveryStatus || 'processed';
  const currentIndex = steps.findIndex(s => s.id === currentStatus);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
       <motion.div 
         initial={{ scale: 0.95, opacity: 0, y: 20 }}
         animate={{ scale: 1, opacity: 1, y: 0 }}
         className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative border border-slate-100 dark:border-white/5"
         dir="rtl"
       >
         {/* Header */}
         <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 -rotate-12 translate-x-1/4">
              <Truck size={180} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black tracking-tight">تتبع رحلة سيارتك</h3>
              <p className="text-indigo-100 text-xs font-bold mt-1 uppercase tracking-widest">{sale.invoiceNumber} • {sale.carName}</p>
            </div>
            <button onClick={onClose} className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full transition-all relative z-10">
              <X size={20} />
            </button>
         </div>

         {/* Steps Body */}
         <div className="p-10 space-y-10">
            {steps.map((step, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isPending = index > currentIndex;

              return (
                <div key={step.id} className="relative flex gap-8">
                  {index !== steps.length - 1 && (
                    <div className={`absolute top-12 right-6 w-0.5 h-14 -z-10 transition-colors duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`} />
                  )}

                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-700 ${
                    isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20' :
                    isCurrent ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-600/30 scale-125 z-10' :
                    'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-300'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={24} /> : <step.icon size={24} className={isCurrent ? 'animate-pulse' : ''} />}
                  </div>

                  <div className={`flex-1 transition-all duration-700 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                    <h4 className={`text-lg font-black ${isCurrent ? 'text-indigo-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mt-1">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
         </div>

         {/* Footer Action */}
         <div className="p-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex gap-4">
            <button className="flex-1 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-xs border border-slate-200 dark:border-white/10 hover:bg-slate-100 transition-all">
              تحميل التقرير
            </button>
            <button className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2">
              <MessageSquare size={16} /> التواصل مع منسق الشحن
            </button>
         </div>
       </motion.div>
    </div>
  );
};

export default DeliveryTrackerModal;