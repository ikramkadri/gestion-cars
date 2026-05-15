import { useState } from 'react';
import { 
  Gauge, Fuel, Settings, MapPin, Hash, ShieldCheck, Zap, Award, Info,
  Phone, MessageCircle, CalendarCheck, Heart, Share2, User, Star, ChevronLeft
} from 'lucide-react';
import { CarType } from '../features/cars/types/car.types';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { motion, AnimatePresence } from 'framer-motion';

interface CarDetailsContentProps {
  car: CarType;
  siteSettings: {
    contactPhone?: string;
    contactWhatsApp?: string;
    showroomName?: string;
    [key: string]: unknown;
  } | null | undefined;
}

const CarDetailsContent = ({ car, siteSettings }: CarDetailsContentProps) => {
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const token = localStorage.getItem("convex_token") || "";
  const user = useQuery(api.users.viewer, token ? { token } : "skip");
  
  const reserveCar = useMutation(api.bookings.reserveCar);

  const isHex = (color?: string) => color && /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color);
  const accentColor = isHex(car.color) ? car.color! : '#2563eb';
  const goldColor = '#D4AF37';

  const specs = [
    { label: 'المسافة المقطوعة', value: `${car.mileage.toLocaleString()} كم`, icon: <Gauge size={22} />, detail: 'حالة العداد' },
    { label: 'سعة المحرك', value: car.engineSize || 'N/A', icon: <Settings size={22} />, detail: 'أداء المحرك' },
    { label: 'نوع الوقود', value: car.fuel === 'Gasoline' ? 'بنزين' : car.fuel === 'Diesel' ? 'ديزل' : car.fuel === 'Electric' ? 'كهرباء' : 'هجين', icon: <Fuel size={22} />, detail: 'كفاءة الاستهلاك' },
    { label: 'ناقل الحركة', value: car.transmission === 'Automatic' ? 'أوتوماتيك' : 'يدوي', icon: <Zap size={22} />, detail: 'التحكم بالقيادة' },
    { label: 'نظام الدفع', value: car.drivetrain || 'N/A', icon: <Award size={22} />, detail: 'ثبات الطريق' },
    { label: 'الأسطوانات', value: car.cylinders ? `${car.cylinders}V` : 'N/A', icon: <Info size={22} />, detail: 'قوة الدفع' },
  ];

  return (
    <div className="bg-[#F2F2F2] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden transition-colors duration-500" dir="rtl">
      {/* Hero Background Effect */}
      <div className="absolute top-0 right-0 w-[50%] h-[600px] bg-[#D4AF37]/[0.05] dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-12 lg:py-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Column: Media Gallery ONLY */}
          <div className="flex-1 space-y-8">
            
            {/* Premium Gallery */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="relative aspect-[16/10] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-2xl group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg || car.mainImageUrl}
                    src={activeImg || car.mainImageUrl || ""}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full object-cover"
                    alt="Car Hero"
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                
                {/* Floating Actions on Image */}
                <div className="absolute top-8 left-8 flex gap-3">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-4 rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-90 ${isLiked ? 'bg-rose-500 text-white border-rose-400' : 'bg-white/20 dark:bg-white/5 text-white hover:bg-white/30 dark:hover:bg-white/10'}`}
                  >
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                  </button>
                  <button className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all">
                    <Share2 size={20} />
                  </button>
                </div>

                <div className="absolute bottom-8 right-8">
                   <span className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-xs font-black uppercase tracking-widest">
                     <ShieldCheck className="text-emerald-400" size={16} /> فحص معتمد
                   </span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {[car.mainImageUrl, ...(car.imagesUrls || [])].filter(Boolean).slice(0, 5).map((url, i) => (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={i}
                    onClick={() => setActiveImg(url!)}
                    className={`aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden cursor-pointer border-2 transition-all ${activeImg === url || (!activeImg && i === 0) ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-200 dark:border-white/5 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={url!} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: ALL INFO GROUPED TOGETHER */}
          <div className="w-full lg:w-[480px]">
            <div className="lg:sticky lg:top-24 space-y-6">
              
              {/* The Unified Info Container */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-50 dark:bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl space-y-10"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                      {car.condition === 'New' ? 'حصري' : 'نخبة المستعمل'}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                      <MapPin size={14} className="text-blue-500" /> {car.location}
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">{car.make} {car.model}</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-bold">إصدار عام {car.year} • {car.fuel === 'Gasoline' ? 'بنزين' : 'ديزل'}</p>
                </div>

                {/* HIGH VISIBILITY PRICE */}
              <div className="p-8 rounded-[2.5rem] bg-white dark:bg-blue-600/20 border-2 border-[#E5E4E2] dark:border-blue-500/30 text-center shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: goldColor }}>السعر النهائي المتوفر</p>
                  <div className="flex items-baseline justify-center gap-3">
                    <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{(car.price / 1000000).toFixed(1)}</span>
                  <span className="text-2xl font-black" style={{ color: goldColor }}>مليون دج</span>
                  </div>
                </div>

                {/* Unified Specifications Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {specs.map((spec, i) => (
                  <div key={i} className="bg-white dark:bg-white/[0.03] p-5 rounded-3xl border border-[#E5E4E2] dark:border-white/5 flex items-center gap-4 group hover:shadow-lg transition-all">
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                          {spec.icon}
                       </div>
                       <div className="overflow-hidden">
                          <p className="text-[8px] font-black text-slate-400 uppercase truncate">{spec.label}</p>
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{spec.value}</p>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Compact Description */}
                <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/10">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                    مواصفات إضافية
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {car.description || "مركبة فاخرة تم اختيارها بعناية من قبل فريق MOTORIX لضمان أعلى مستويات الجودة والاعتمادية."}
                  </p>
                  {car.vin && (
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                      <Hash size={12} className="text-blue-500" />
                      <span className="text-[10px] font-bold text-slate-500">رقم الهيكل:</span>
                      <code className="text-[10px] text-blue-500 font-mono tracking-widest">{car.vin}</code>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={async () => {
                      if (!token) {
                        toast.error("يرجى تسجيل الدخول لحجز مركبتك");
                        return;
                      }
                      
                      if (user?.status !== 'active') {
                        toast.error("حسابك قيد المراجعة. ستتمكن من الحجز فور تفعيل حسابك من قبل الإدارة.", {
                          duration: 5000,
                        });
                        return;
                      }
                      
                      const toastId = toast.loading("جاري معالجة طلب الحجز...");
                      try {
                        await reserveCar({ carId: car._id as Id<"cars">, token });
                        toast.success("تم استلام طلبك! رقم الحجز: #MTX-" + Math.floor(Math.random() * 9000 + 1000), { id: toastId });
                      } catch (error: unknown) {
                        toast.error(error instanceof Error ? error.message : "حدث خطأ", { id: toastId });
                      }
                    }}
                  className="w-full flex items-center justify-center gap-3 text-white p-6 rounded-2xl font-black shadow-xl hover:-translate-y-1 transition-all active:scale-95 group"
                  style={{ backgroundColor: accentColor, boxShadow: `0 20px 40px -10px ${accentColor}40` }}
                  >
                    <CalendarCheck size={24} />
                    احجز تجربة قيادة
                    <ChevronLeft size={18} className="mr-auto group-hover:-translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <a href={`tel:${siteSettings?.contactPhone || ''}`} className="flex items-center justify-center gap-2 bg-white/5 text-white p-5 rounded-2xl font-black border border-white/5 hover:bg-white/10 transition-all">
                      <Phone size={20} className="text-blue-500" /> اتصال
                    </a>
                    <a href={`https://wa.me/${siteSettings?.contactWhatsApp || ''}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-white p-5 rounded-2xl font-black hover:opacity-90 transition-all shadow-lg shadow-emerald-500/10">
                      <MessageCircle size={20} /> واتساب
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Seller Card */}
              <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl">
                  <User size={30} />
                </div>
                <div className="flex-1">
                  <h5 className="font-black text-white text-sm">مستشار المبيعات</h5>
                  <p className="text-xs text-slate-500 font-bold">فريق {siteSettings?.showroomName || "MOTORIX"}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className="fill-amber-500 text-amber-500" />)}
                    <span className="text-[10px] text-slate-400 font-black mr-2">4.9/5</span>
                  </div>
                </div>
                <button className="p-3 bg-white/5 rounded-xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all">
                  <ChevronLeft size={20} />
                </button>
              </div>

              {/* Security Hint */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                <p className="text-[11px] text-emerald-500/80 font-bold leading-relaxed">
                  هذه المركبة محمية بنظام الحماية الخاص بنا. نضمن لك صحة البيانات المذكورة وتوفر الأوراق القانونية.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Similar Cars Preview (Mockup Section) */}
        <div className="mt-32 space-y-10">
           <div className="flex items-end justify-between border-b border-white/5 pb-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white">مركبات مشابهة قد تثير اهتمامك</h2>
                <p className="text-slate-500 font-medium italic underline decoration-blue-600/30 underline-offset-8">مختارات ذكية بناءً على تفضيلاتك الحالية</p>
              </div>
              <button className="flex items-center gap-2 text-blue-500 font-black text-sm hover:translate-x-2 transition-transform">
                عرض الكل <ChevronLeft size={18} />
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 opacity-40 grayscale pointer-events-none">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed" />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsContent;