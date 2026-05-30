import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, ChevronLeft, Gauge, Car, X,
  Fuel, Settings, Eye, MapPin, Calendar, Share2, Zap,
  Calculator
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { Id } from '../../convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';
import { CarType } from '../features/cars/types/car.types'; // Import CarType
import { toast } from 'react-hot-toast';
import { useLang } from '../lib/LanguageContext';
import TypewriterText from './TypewriterText'; // Import the extracted component
import LoanCalculator from './LoanCalculator'; // LoanCalculator is already typed



const hexToRGBA = (hex: string, alpha: number) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
  } else {
    r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
// تعريف واجهة محلية لتوسيع CarType مع الحقول المخصصة
interface CarCardCarType extends CarType {
  showroomLogo?: string;
  advisorAvatar?: string;
}

interface CarCardProps {
  car: CarCardCarType; // استخدام الواجهة الموسعة هنا
  showRemoveButton?: boolean;
}

const CarCard = ({ car, showRemoveButton }: CarCardProps) => {
  const navigate = useNavigate();
  const { language: lang } = useLang();

  // قاموس ترجمة بسيط لحالات السيارة
  const statusTranslations = {
    ar: {
      available: "متاح حالياً",
      sold: "تم البيع - SOLD",
      reserved: "محجوزة"
    },
    fr: {
      available: "Disponible",
      sold: "VENDU",
      reserved: "Réservé"
    },
    en: {
      available: "Available",
      sold: "SOLD",
      reserved: "Reserved"
    }
  };
  const st = statusTranslations[lang as 'ar' | 'fr' | 'en'] || statusTranslations.ar;

  // دمج منطق الصور ليدعم الروابط المباشرة (القديمة) وروابط التخزين (الجديدة)
  // تم تعديل هذا الجزء لضمان أن مصفوفة الصور تحتوي على روابط صالحة فقط (string)
  // ولحل مشكلة 'string | null' is not assignable to 'string'
  const images = useMemo(() => {
    const list: string[] = [];
    if (car.mainImageUrl && typeof car.mainImageUrl === 'string') {
      list.push(car.mainImageUrl);
    }
    else if (typeof car.mainImage === 'string' && car.mainImage.startsWith('http')) {
      list.push(car.mainImage);
    }
    
    if (car.imagesUrls && car.imagesUrls.length > 0) list.push(...car.imagesUrls.filter((url): url is string => url !== null && url !== undefined));
    return list.length > 0 ? list : ["/images/placeholder-car.svg"];
  }, [car]);
 
  const [isHovered, setIsHovered] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const token = localStorage.getItem("convex_token") || "";
  const myFavorites = useQuery(api.favorites.getMyFavorites, token ? { token } : "skip");
  const toggleFavorite = useMutation(api.favorites.toggleFavorite);

  const isLiked = useMemo(() => {
    return myFavorites?.some(fav => fav?._id === car._id) ?? false;
  }, [myFavorites, car._id]);

  const settings = useQuery(api.site_settings.getSettings);
  const logoImageUrl = useQuery(
    api.files.getImageUrl,
    settings?.logoImageId ? { storageId: settings.logoImageId as Id<"_storage"> } : "skip"
  );

  // الألوان الأساسية الموحدة لضمان التناسق (الأزرق والذهبي)
  const accentColor = '#2563eb'; 
  const goldColor = '#D4AF37';

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/inventory/${car._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${car.make} ${car.model}`,
          url: url
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("تم نسخ رابط الإعلان بنجاح!", {
        style: { borderRadius: '15px', background: '#1e293b', color: '#fff' },
      });
    }
  };



  return (
    <div className="flex flex-col items-center justify-center w-full py-6 font-sans select-none" dir="rtl">

      {/* البطاقة الرئيسية */}
      <div 
        onClick={() => {
          if (car._id) {
            navigate(`/inventory/${car._id}`);
          } else {
            toast.error("المعرف غير موجود");
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-col w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-[0_20px_70px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 border border-slate-100 dark:border-white/5 h-auto cursor-pointer hover:-translate-y-3"
        style={{ 
          borderTop: `5px solid ${accentColor}`,
          boxShadow: isHovered ? `0 40px 100px -20px ${hexToRGBA(accentColor, 0.2)}` : undefined 
        }}
      >
        
        {/* قسم معرض الصور */}
        <div className="relative w-full aspect-[4/3] overflow-hidden shrink-0 bg-slate-100">
          <img 
            src={car.mainImageUrl || images[0]} 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110 ${
              car.status === "Sold" ? 'grayscale-[0.6] brightness-75' : 
              car.status === "Reserved" ? 'brightness-90' : ''
            }`}
            alt={`${car.make} ${car.model}`}
            loading="lazy"
          />

          {/* Sold Overlay - التأثير الاحترافي للسيارات المباعة */}
          {car.status === "Sold" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px]" />
              <div className="relative rotate-[-12deg] border-2 border-white/90 px-4 py-1 rounded-lg shadow-2xl animate-in zoom-in duration-500 bg-slate-900/40">
                <span className="text-white text-xl font-black uppercase tracking-tighter drop-shadow-lg">
                  {st.sold}
                </span>
              </div>
            </div>
          )}

          {/* Reserved Overlay - التأثير الاحترافي للسيارات المحجوزة */}
          {car.status === "Reserved" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-amber-900/10 backdrop-blur-[0.5px]" />
              <div className="relative rotate-[-12deg] border-2 border-amber-400 px-4 py-1 rounded-lg shadow-2xl animate-in zoom-in duration-500 bg-amber-500/20">
                <span className="text-amber-400 text-xl font-black uppercase tracking-tighter drop-shadow-lg">
                  {st.reserved}
                </span>
              </div>
            </div>
          )}
          
          {/* أزرار التفاعل العائمة (الإعجاب والمشاركة) */}
          <div className="absolute top-6 left-6 flex gap-3 z-[60]">
            <button 
              onClick={async (e) => { 
                e.stopPropagation(); // Prevent card click
                if (!token) {
                  toast.error("يرجى تسجيل الدخول للإضافة للمفضلة");
                  return navigate('/login', { state: { from: window.location.pathname } });
                }
                try {
                  await toggleFavorite({ carId: car._id as Id<"cars">, token });
                  if(!isLiked) toast.success("تمت الإضافة للمفضلة ❤️");
                } catch (error: unknown) {
                  const errorMessage = error instanceof Error ? error.message : "";
                  // إذا كان الخطأ بسبب انتهاء الجلسة أو عدم تسجيل الدخول، نوجه المستخدم فوراً
                  if (errorMessage.includes("تسجيل الدخول")) {
                    localStorage.removeItem("convex_token"); // تنظيف التوكن التالف
                    toast.error("انتهت جلستك، يرجى تسجيل الدخول مجدداً");
                    return navigate('/login', { state: { from: window.location.pathname } });
                  }
                  toast.error(errorMessage || "حدث خطأ أثناء تحديث المفضلة");
                }
              }}
              className={`p-3 rounded-xl backdrop-blur-xl border border-white/10 transition-all active:scale-90 ${
                isLiked ? 'bg-rose-500 text-white border-rose-400 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={handleShare}
              className="p-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/10 text-white hover:bg-white/30 transition-all active:scale-90 shadow-lg"
            >
              <Share2 size={18} />
            </button>
          </div>

          {/* Overlay and Navigation Buttons removed */}

          {/* حالة السيارة أو زر الإزالة */}
          <div className={`absolute top-6 right-6 z-20 transition-all duration-300 ${showRemoveButton ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100'}`}>
            <span className={`flex items-center gap-2 backdrop-blur-md text-[12px] font-black px-4 py-2.5 rounded-2xl shadow-2xl border-2 ${
              car.status === "Available" ? 'bg-white/95 text-emerald-600 border-white' : 
              car.status === "Sold" ? 'bg-slate-900/90 text-white border-slate-700' : 
              'bg-amber-500/95 text-white border-amber-400'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                car.status === "Available" ? 'bg-emerald-500' : car.status === "Sold" ? 'bg-rose-500' : 'bg-white'
              }`} />
              {car.status === "Available" ? st.available : 
               car.status === "Sold" ? st.sold : 
               st.reserved}
            </span>
          </div>

          {showRemoveButton && (
            <button 
              onClick={async (e) => { 
                e.stopPropagation(); 
                try {
                  await toggleFavorite({ carId: car._id as Id<"cars">, token });
                  toast.success("تمت الإزالة من المفضلة");
                } catch (error: unknown) {
                  toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الإزالة");
                }
              }}
              className="absolute top-6 left-6 z-30 p-2.5 bg-rose-600 text-white rounded-xl shadow-xl hover:bg-rose-700 transition-all hover:scale-110 active:scale-95 border border-rose-400/50"
              title="إزالة من المفضلة"
            >
              <X size={18} strokeWidth={3} />
            </button>
          )}

          {/* Showroom Logo instead of image dots */}
          <div className="absolute bottom-6 left-6 z-20">
            {logoImageUrl ? (
              <img
                src={logoImageUrl}
                alt="Showroom Logo" 
                className="w-10 h-10 object-contain rounded-full bg-white/30 backdrop-blur-sm border border-white/10 p-1" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
                <Car size={20} className="text-white" />
              </div>
            )}
            
          </div>
        </div>

        {/* قسم المحتوى */}
        <div className="flex-1 p-6 flex flex-col justify-between bg-white dark:bg-slate-900 relative">
          
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-full">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className="text-[11px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-widest shadow-sm border transition-all"
                  style={{ backgroundColor: hexToRGBA(goldColor, 0.1), color: goldColor, borderColor: hexToRGBA(goldColor, 0.2) }}
                >
                  {car.condition === 'New' || car.year >= new Date().getFullYear() - 1 ? (
                    <span className="flex items-center gap-1"><Zap size={10} fill="currentColor" /> جديد</span>
                  ) : (
                    'مستعمل'
                  )} {car.year}
                </span>
                {car.status === "Reserved" && (
                  <span 
                    className="text-[11px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-widest shadow-sm border transition-all bg-amber-50 text-amber-600 border-amber-100"
                  >
                    محجوز
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                  <Eye size={14} /> {car.viewCount || 0} مشاهدة
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors duration-500">
                {isHovered ? (
                  <TypewriterText text={`${car.make} ${car.model}`} />
                ) : (
                  <>
                    {car.make} <span className="text-slate-600 dark:text-slate-400">{car.model}</span>
                  </>
                )}
              </h3>
              <div className="flex items-center gap-4 text-slate-400 font-bold text-xs">
                <span className="flex items-center gap-2"><MapPin size={18} style={{ color: accentColor }} /> {car.location}</span>
                <span className="flex items-center gap-2"><Calendar size={18} style={{ color: accentColor }} /> {car.year}</span>
              </div>
            </div>

          </div>

          {/* المواصفات الرئيسية */}
          <div className="grid grid-cols-3 gap-3 my-6 group/specs">
            {[
              { label: 'المسافة', value: `${car.mileage?.toLocaleString() || 0} كم`, icon: <Gauge size={22} /> },
              { label: 'المحرك', value: car.engineSize || (car.cylinders ? `${car.cylinders}V` : "N/A"), icon: <Settings size={22} /> },
              { label: 'الوقود', value: car.fuel === 'Gasoline' ? 'بنزين' : car.fuel === 'Diesel' ? 'ديزل' : car.fuel === 'Electric' ? 'كهرباء' : car.fuel === 'Hybrid' ? 'هجين' : 'غير محدد', icon: <Fuel size={22} /> }
            ].map((item, idx) => (
              <div key={idx} className="group/spec flex flex-col items-center text-center gap-2 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 transition-all duration-500 hover:bg-blue-600 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20">
                <div 
                  className="p-2 rounded-xl transition-all duration-500 group-hover:animate-bounce group-hover/spec:bg-white/20 group-hover/spec:text-white group-hover/spec:-translate-y-2"
                  style={{ backgroundColor: hexToRGBA(accentColor, 0.1), color: accentColor }}
                >
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider group-hover/spec:text-blue-100">{item.label}</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white group-hover/spec:text-white">{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* الجزء السفلي */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              {/* صورة مستشار المبيعات - تظهر بجانب السعر عند توفرها */}
              {car.advisorAvatar && (
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden shadow-sm shrink-0">
                  <img src={car.advisorAvatar} alt="Sales Advisor" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2 transition-all duration-500">
                  <span className="text-4xl font-black tracking-tighter" style={{ color: goldColor }}>{(car.price / 1000000).toFixed(1)}</span>
                  <span className="text-xs font-black text-slate-500 uppercase">مليون دج</span>
                </div>
                {car.status === "Available" && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsCalculatorOpen(true); }}
                    className="flex items-center gap-1 text-[11px] font-black text-indigo-600 hover:text-indigo-700 transition-all mt-1 bg-indigo-50 px-2 py-0.5 rounded-lg w-fit border border-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-500/20 shadow-sm active:scale-95"
                  >
                    <Calculator size={13} />
                    احسب التقسيط
                  </button>
                )}
              </div>
            </div>
            
            <span 
              className="text-xs font-black group-hover:translate-x-1 transition-all duration-500 flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border shadow-sm"
              style={{ 
                color: goldColor,
                boxShadow: isHovered ? `0 10px 25px -5px ${hexToRGBA(goldColor, 0.4)}` : undefined,
                borderColor: isHovered ? hexToRGBA(goldColor, 0.4) : hexToRGBA(goldColor, 0.1)
              }}
            >
              {car.status === "Sold" ? "سجل المبيعات" : car.status === "Reserved" ? "تفاصيل الحجز" : "عرض الإعلان"} 
              <ChevronLeft size={14} />
            </span>
          </div>
        </div>
      </div>

      {/* مودال حاسبة القروض */}
      {isCalculatorOpen && (
        <LoanCalculator 
          price={car.price} 
          onClose={() => setIsCalculatorOpen(false)} 
        />
      )}
    </div>
  );
};

export default CarCard;