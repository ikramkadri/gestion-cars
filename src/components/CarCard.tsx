import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, ChevronLeft, Gauge, Car,
  Fuel, Settings, Eye, MapPin, Calendar, Share2
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { Id } from '../../convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';
import { CarType } from '../features/cars/types/car.types'; // Import CarType
import { toast } from 'react-hot-toast';

/**
 * مكون داخلي لمحاكاة تأثير الكتابة
 */
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 40); // سرعة الكتابة (بالملي ثانية)
    return () => clearInterval(timer);
  }, [text]);
  return <>{displayText}</>;
};

// الدوال المساعدة تم تجميعها هنا لضمان عدم التكرار وحل مشكلة 'already declared'
const isHex = (color?: string) => color && /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color);

const hexToRGBA = (hex: string, alpha: number) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
  } else {
    r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface CarCardProps {
  car: CarType;
}

const CarCard = ({ car }: CarCardProps) => {
  const navigate = useNavigate();

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
    return list.length > 0 ? list : ["/images/placeholder-car.jpg"];
  }, [car]);
 
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const settings = useQuery(api.site_settings.getSettings);
  const logoImageUrl = useQuery(
    api.files.getImageUrl,
    settings?.logoImageId ? { storageId: settings.logoImageId as Id<"_storage"> } : "skip"
  );

  // الألوان الأساسية الموحدة لضمان التناسق (الأزرق والذهبي)
  const accentColor = '#2563eb'; 
  const goldColor = '#D4AF37';

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/inventory/${car._id}`;
    navigator.clipboard.writeText(url);
    toast.success("تم نسخ رابط الإعلان بنجاح!", {
      style: {
        borderRadius: '15px',
        background: '#1e293b',
        color: '#fff',
      },
    });
  };



  return (
    <div className="flex flex-col items-center justify-center w-full py-6 font-sans select-none" dir="rtl">

      {/* البطاقة الرئيسية */}
      <div 
        onClick={() => car._id ? navigate(`/inventory/${car._id}`) : toast.error("المعرف غير موجود")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-col w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-[0_20px_70px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 border border-slate-100 dark:border-white/5 h-auto cursor-pointer hover:-translate-y-3"
        style={{ 
          borderTop: `5px solid ${accentColor}`,
          boxShadow: isHovered ? `0 40px 100px -20px ${hexToRGBA(accentColor, 0.2)}` : undefined 
        }}
      >
        
        {/* قسم معرض الصور */}
        <div className="relative w-full aspect-[4/3] overflow-hidden shrink-0">
          {images.map((img, i) => (
            <img 
              key={i}
              src={car.mainImageUrl || img} // عرض الصورة الرئيسية فقط
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-105`}
              alt={`${car.make} ${car.model}`}
              loading="lazy" // إضافة خاصية التحميل الكسول
            />
          ))}
          
          {/* أزرار التفاعل العائمة (الإعجاب والمشاركة) */}
          <div className="absolute top-6 left-6 flex gap-3 z-[60]">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsLiked(!isLiked); 
                if(!isLiked) toast.success("تمت الإضافة للمفضلة ❤️");
                else toast("تمت الإزالة من المفضلة", { icon: '🗑️' });
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

          <div className="absolute top-6 right-6 z-20">
            <span className={`flex items-center gap-2 backdrop-blur-md text-[11px] font-black px-4 py-2.5 rounded-2xl shadow-xl border ${car.status === "Available" ? 'bg-white/90 text-emerald-600 border-white' : 'bg-rose-500 text-white border-rose-400'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${car.status === "Available" ? 'bg-emerald-500' : 'bg-white'}`} />
              {car.status === "Available" ? "متاح حالياً" : "مباع"}
            </span>
          </div>

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
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span 
                  className="text-[11px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-widest shadow-sm border transition-all"
                  style={{ backgroundColor: hexToRGBA(goldColor, 0.1), color: goldColor, borderColor: hexToRGBA(goldColor, 0.2) }}
                >
                  {car.condition === 'New' ? 'جديد' : 'مستعمل'} {car.year}
                </span>
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
            <div 
              className="flex items-baseline gap-2 transition-all duration-500"
              style={{ 
                filter: isHovered ? `drop-shadow(0 0 8px ${hexToRGBA(goldColor, 0.4)})` : 'none' 
              }}
            >
              <span className="text-4xl font-black tracking-tighter" style={{ color: goldColor }}>{(car.price / 1000000).toFixed(1)}</span>
              <span className="text-xs font-black text-slate-500 uppercase">مليون دج</span>
            </div>
            <span 
              className="text-xs font-black group-hover:translate-x-1 transition-all duration-500 flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border shadow-sm"
              style={{ 
                color: goldColor,
                boxShadow: isHovered ? `0 10px 25px -5px ${hexToRGBA(goldColor, 0.4)}` : undefined,
                borderColor: isHovered ? hexToRGBA(goldColor, 0.4) : hexToRGBA(goldColor, 0.1)
              }}
            >
              عرض الإعلان <ChevronLeft size={14} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;