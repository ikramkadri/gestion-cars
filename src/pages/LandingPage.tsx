import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal,
  ShieldAlert, 
  Zap, 
  ArrowRight, MousePointer2,
  ChevronDown, Rocket, ShieldCheck, Users, ChevronLeft
} from 'lucide-react';
import { CarType } from '../features/cars/types/car.types';
import { Id } from '../../convex/_generated/dataModel';
import CarCard from '../components/CarCard'; // استيراد مكون CarCard العام
import TestimonialsSection from '../components/TestimonialsSection'; // استيراد قسم التقييمات
import { motion, AnimatePresence } from 'framer-motion';

// قائمة الماركات مع شعارات عالية الجودة (SVGs) لضمان الوضوح التام
const BRANDS = [
  { name: 'Toyota', logo: 'https://cdn.simpleicons.org/toyota/black' },
  { name: 'Mercedes-Benz', logo: 'https://cdn.simpleicons.org/mercedes/black' },
  { name: 'BMW', logo: 'https://cdn.simpleicons.org/bmw/black' },
  { name: 'Audi', logo: 'https://cdn.simpleicons.org/audi/black' },
  { name: 'Volkswagen', logo: 'https://cdn.simpleicons.org/volkswagen/black' },
  { name: 'Hyundai', logo: 'https://cdn.simpleicons.org/hyundai/black' },
  { name: 'Renault', logo: 'https://cdn.simpleicons.org/renault/black' },
  { name: 'Peugeot', logo: 'https://cdn.simpleicons.org/peugeot/black' },
  { name: 'Kia', logo: 'https://cdn.simpleicons.org/kia/black' },
  { name: 'Ford', logo: 'https://cdn.simpleicons.org/ford/black' },
  { name: 'Nissan', logo: 'https://cdn.simpleicons.org/nissan/black' },
  { name: 'Dacia', logo: 'https://cdn.simpleicons.org/dacia/black' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // جلب إعدادات الموقع
  const settings = useQuery(api.site_settings.getSettings);
  const logoImageUrl = useQuery(
    api.files.getImageUrl,
    settings?.logoImageId ? { storageId: settings.logoImageId as Id<"_storage"> } : "skip"
  );
  const token = localStorage.getItem("convex_token") || "";

  const [typedText, setTypedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 }); // حتى 10 ملايير سنتيم
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // تحديث البحث تلقائياً مع تأخير (Debounce) بمقدار 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // استخدام دالة البحث بدلاً من الجلب العادي
  const cars = useQuery(api.cars.searchCars, { 
    searchTerm: debouncedSearchQuery, 
    make: selectedMake === "كل الماركات" || !selectedMake ? undefined : selectedMake,
    minPrice: priceRange.min > 0 ? priceRange.min : undefined,
    maxPrice: priceRange.max < 100000000 ? priceRange.max : undefined,
    location: selectedLocation === "كل الولايات" || !selectedLocation ? undefined : selectedLocation,
    status: "Available" 
  });

  const heroMessages = useMemo(() => {
    return [
      "اعثر على سيارة أحلامك",
      `معرض السيارات الأول في ${settings?.showroomName || "الجزائر"}`,
      "احجز سيارتك المفضلة بكل أمان"
    ];
  }, [settings]);

  useEffect(() => {
    const handleTyping = () => {
      const currentMessage = heroMessages[textIndex];
      if (isDeleting) setTypedText(currentMessage.substring(0, typedText.length - 1));
      else setTypedText(currentMessage.substring(0, typedText.length + 1));

      if (!isDeleting && typedText === currentMessage) setTimeout(() => setIsDeleting(true), 2000);
      else if (isDeleting && typedText === '') {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % heroMessages.length);
      }
    };
    const timer = setTimeout(handleTyping, isDeleting ? 40 : 80);
    return () => clearTimeout(timer);
  }, [typedText, isDeleting, textIndex, heroMessages]);

  // تنفيذ الحجز التلقائي بعد العودة من صفحة الدخول
  useEffect(() => {
    if (token && location.state?.pendingCarId) {
      const carId = location.state.pendingCarId;
      // توجيه المستخدم لصفحة التفاصيل لإكمال الحجز بالمعلومات المطلوبة
      navigate(`/inventory/${carId}`, { 
        state: { from: location.pathname, pendingCarId: carId },
        replace: true 
      });
    }
  }, [token, location.state, navigate, location.pathname]);

  return (
    <div className="bg-[#050505] dark:bg-slate-950 transition-colors duration-500 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070" 
            className="w-full h-full object-cover opacity-50 scale-105 animate-[subtle-zoom_20s_infinite]" 
            alt="سيارة فخمة" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
        </div>
        
        <div className="relative z-10 text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black text-blue-400 mb-8 backdrop-blur-md uppercase tracking-widest animate-pulse">
            <Zap size={14} className="text-amber-500" />
            <span>The Future of Driving is Here</span>
          </div>

          <h1 className="text-white text-5xl md:text-7xl font-black mb-10 h-48 flex items-center justify-center tracking-tighter leading-none bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            {typedText}
          </h1>
          
          <div className="mt-10 mb-10 flex justify-center">
            <button 
              onClick={() => navigate('/login')} // زر "ابدأ الآن"
              className="relative bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl overflow-hidden hover:bg-blue-700 transition-all flex items-center gap-3 shadow-2xl shadow-blue-500/40 active:scale-95 group"
            >
              ابدأ الآن <ArrowRight size={22} className="rotate-180" />
              {/* تأثير اللمعان الذهبي */}
              <span className="absolute inset-0 block bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 animate-shine" />
            </button>
          </div>

          {/* شريط البحث المطور - خلفية بيضاء لتباين مثالي */}
          <div className="bg-white/95 backdrop-blur-2xl p-4 rounded-[3rem] border border-slate-200 flex flex-col gap-4 max-w-5xl mx-auto shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-[2] bg-slate-100 rounded-[2rem] flex items-center px-6 py-4 border border-slate-200 focus-within:border-blue-500/50 transition-all">
                <Search className="text-blue-500 ml-4" size={24} />
                <input 
                  type="text" 
                  placeholder="ابحث عن ماركة، موديل، سنة..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none w-full font-bold text-slate-900 placeholder:text-slate-400 text-right" dir="rtl" />
              </div>
              
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`p-4 rounded-[2rem] border transition-all flex items-center justify-center gap-3 font-black text-sm ${showAdvanced ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
              >
                <SlidersHorizontal size={20} />
                <span>تصفية</span>
              </button>

              <button className="bg-blue-600 text-white px-12 py-4 rounded-[2rem] font-black text-lg hover:bg-blue-500 transition-all shadow-xl active:scale-95">
                بحث
              </button>
            </div>

            {/* الفلاتر المتقدمة - ريقله في الألوان */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 overflow-hidden"
                >
                  <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                      <MapPin size={14} /> الولاية
                    </div>
                    <select 
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full bg-transparent outline-none font-bold text-slate-900 text-right appearance-none" dir="rtl"
                    >
                      <option value="">كل الولايات</option>
                      <option value="Alger">الجزائر العاصمة</option>
                      <option value="Oran">وهران</option>
                      <option value="Blida">البليدة</option>
                      <option value="Sétif">سطيف</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex flex-col items-start">
                        <span className="text-slate-900 font-black text-sm">{(priceRange.max / 1000000).toFixed(1)} مليون دج</span>
                        <span className="text-amber-600 font-bold text-[9px]">≈ {(priceRange.max / 10000).toLocaleString()} مليون سنتيم</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                        <MousePointer2 size={14} /> السعر الأقصى
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100000000" 
                      step="500000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-full accent-blue-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 animate-bounce flex flex-col items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Explore</span>
          <ChevronDown size={20} />
        </div>
      </section>

      {/* شريط الماركات - لزيادة الثقة - يظهر مباشرة بعد البحث */}
      <div className="bg-white dark:bg-slate-900 py-12 border-b border-slate-100 dark:border-slate-800 overflow-hidden relative z-20">
        <div className="max-w-7xl mx-auto relative group px-6">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10" />
          <div className="flex animate-marquee whitespace-nowrap gap-16 items-center">
            {[...BRANDS, ...BRANDS].map((brand, i) => (
              <div key={i} className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-all grayscale hover:grayscale-0">
                <img src={brand.logo} alt={brand.name} className="h-12 w-12 object-contain" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. قسم تسوق معنا - مع عرض سيارات مختارة واللمسة الذهبية */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="w-20 h-1 bg-blue-600 mb-6 rounded-full" />
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">تسوق من تشكيلتنا الفاخرة</h2>
            <p className="text-slate-500 font-bold mb-8 max-w-xl italic">تصفح مجموعة مختارة من أفضل السيارات المتوفرة حالياً</p>
            
            <button 
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-2 text-amber-500 font-black hover:text-amber-600 transition-all group mb-12"
            >
              <span>كل السيارات</span>
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cars?.slice(0, 8).map((car: CarType) => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* 3. أحدث العروض - 3 سيارات فقط */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-[#f8f9fd] dark:bg-slate-900 py-24 px-6 border-y border-slate-100 dark:border-white/5" 
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-2 text-right">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">أحدث الإضافات <span className="text-blue-600">🔥</span></h2>
              <p className="text-slate-500 font-bold italic">نخبة مختارة من السيارات التي انضمت لأسطولنا حديثاً</p>
            </div>
            <button 
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-2 text-slate-900 dark:text-white font-black group hover:text-amber-500 transition-all"
            >
              <span>استكشف المخزون الكامل</span>
              <ArrowRight size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {cars?.slice(0, 3).map((car: CarType) => ( // عرض آخر 3 فقط
              <CarCard key={car._id} car={car as CarType} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* 4. قسم التشويق: اكتشف تجربة MOTORIX الفريدة */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-slate-950 py-24 text-center" 
        dir="rtl"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6">
            اكتشف تجربة <span className="text-blue-600">{settings?.showroomName || "موتوريكس"}</span> الفريدة
          </h2>
          <p className="text-slate-500 font-bold mb-16 max-w-2xl mx-auto text-lg">نحن لا نبيع السيارات فحسب، بل نقدم لك شريك الطريق الأمثل بمعايير عالمية.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-10">
            {[
              { icon: Rocket, title: "سرعة واحترافية", description: "نظام حجز ذكي وسريع يختصر عليك الوقت والجهد في البحث عن سيارتك." },
              { icon: ShieldCheck, title: "ضمان الموثوقية", description: "كل سيارة في معرضنا تخضع لفحص دقيق لضمان جودتها وسلامتك." },
              { icon: Users, title: "خدمة مخصصة", description: "فريقنا معك في كل خطوة، من الاستشارة الأولى وحتى تسليم المفاتيح." },
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-700 transform hover:-translate-y-2">
                <div className="p-5 rounded-[2rem] bg-blue-50 dark:bg-blue-900/30 text-blue-600 inline-block mb-6 shadow-inner">
                  <feature.icon size={36} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* قسم التقييمات - مكانه مثالي قبل الفوتر لترك انطباع أخير ممتاز */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-20 py-24 bg-white dark:bg-slate-900"
      >
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">آراء عملاء <span className="text-blue-600">MOTORIX</span></h2>
          <p className="text-slate-500 font-bold italic">نحن نفتخر بخدمة آلاف الزبائن الراضين في جميع أنحاء الوطن</p>
        </div>
        <TestimonialsSection />
      </motion.div>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-24 pb-12 px-6 border-t border-white/5" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20 text-right">
            <div>
              <div className="flex items-center gap-2 mb-6">
                {logoImageUrl ? (
                  <img src={logoImageUrl} alt="Showroom Logo" className="w-10 h-10 object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Zap size={24} className="fill-white" />
                  </div>
                )}
                <span className="text-2xl font-black tracking-tighter uppercase">
                  {settings?.showroomName?.split(' ')[0] || "MOTOR"}<span className="text-blue-500">{settings?.showroomName?.split(' ')[1] || "IX"}</span>
                </span>
              </div>
              <p className="text-slate-500 font-bold max-w-sm">المنصة الرائدة لاستعراض واكتشاف السيارات بأمان وثقة.</p>
            </div>
            <div className="flex gap-10">
               <a href="#" className="hover:text-blue-500 font-bold transition-colors">عن موتوريكس</a>
               <a href="#" className="hover:text-blue-500 font-bold transition-colors">تواصل معنا</a>
               <a href="#" className="hover:text-blue-500 font-bold transition-colors">الخصوصية</a>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 text-slate-400 bg-white/5 px-6 py-3 rounded-full border border-white/10">
              <ShieldAlert size={20} className="text-amber-500" />
              <p className="text-sm font-bold">نصيحة أمان: عاين السيارة شخصياً قبل دفع أي مبالغ.</p>
            </div>
            <p className="text-slate-500 font-bold text-sm">© {new Date().getFullYear()} {settings?.showroomName || "MOTORIX"}. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes subtle-zoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.05); }
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(50%); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-30deg); }
          60% { transform: translateX(100%) skewX(-30deg); }
          100% { transform: translateX(100%) skewX(-30deg); }
        }

        .animate-shine { animation: shine 1.5s infinite; }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }
      ` }} />
    </div>
  );
};
export default LandingPage;