import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import {
  Search, 
  MapPin, 
  SlidersHorizontal,
  ShieldAlert, // Removed Star
  Zap, Phone, Info, FileCheck, Shield, X, // Removed Star
  ArrowRight,
  ChevronDown, Rocket, ShieldCheck, Users, ChevronLeft, RefreshCcw,
  TrendingUp, TrendingDown,
  Loader2, MessageSquare, Send, HelpCircle, Facebook
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CarType } from '../features/cars/types/car.types';
import { Id } from '../../convex/_generated/dataModel';
import CarCard from '../components/CarCard'; // استيراد مكون CarCard العام
import { useLang } from '../lib/LanguageContext';
import AboutUsSection from '../components/AboutUsSection'; // Import the new component
import { motion, AnimatePresence } from 'framer-motion';

// قائمة الماركات مع شعارات عالية الجودة (SVGs) لضمان الوضوح التام
const BRANDS = [
  { name: 'Toyota', slug: 'toyota' },
  { name: 'Mercedes-Benz', slug: 'mercedes' },
  { name: 'BMW', slug: 'bmw' },
  { name: 'Audi', slug: 'audi' },
  { name: 'Volkswagen', slug: 'volkswagen' },
  { name: 'Hyundai', slug: 'hyundai' },
  { name: 'Renault', slug: 'renault' },
  { name: 'Peugeot', slug: 'peugeot' },
  { name: 'Kia', slug: 'kia' },
  { name: 'Ford', slug: 'ford' },
  { name: 'Nissan', slug: 'nissan' },
  { name: 'Dacia', slug: 'dacia' },
];

interface FooterLinkProps {
  label: string;
  href?: string;
  onClick?: () => void;
}
const FooterLink = ({ label, onClick }: FooterLinkProps) => {
  const { language } = useLang();
  return (
    <li>
      <button 
        onClick={onClick} 
        className={`text-slate-500 hover:text-blue-500 font-bold transition-all text-sm block py-1 w-full ${language === 'ar' ? 'text-right' : 'text-left'}`}
      >
        {label}
      </button>
    </li>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLang();
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
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 }); // يبدأ من 0 لضمان ظهور كافة السيارات فوراً
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // الحل الاحترافي: مزامنة الحالة أثناء الرندر لتفادي أخطاء الأداء والـ Cascading Renders
  const [prevLanguage, setPrevLanguage] = useState(language);
  if (language !== prevLanguage) {
    setPrevLanguage(language);
    setTypedText('');
    setTextIndex(0);
    setIsDeleting(false);
  }

  // --- محتوى مركز المساعدة والسياسات ---
  const [helpModal, setHelpModal] = useState<{ isOpen: boolean; title: string; content: React.ReactNode } | null>(null);

  const HELP_DATA = useMemo(() => ({
    booking: {
      title: t('how_to_book_title'),
      content: (
        <div className={`space-y-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <p>{t('booking_steps_intro')}</p>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>{t('booking_step_1')}</li>
            <li>{t('booking_step_2')}</li>
            <li>{t('booking_step_3')}</li>
          </ul>
          <p className="font-black text-blue-600 italic">{t('booking_note')}</p>
        </div>
      )
    },
    finance: {
      title: t('finance_terms_title'),
      content: (
        <div className={`space-y-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <p>{t('finance_intro')}</p>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>{t('finance_term_1')}</li>
            <li>{t('finance_term_2')}</li>
            <li>{t('finance_term_3')}</li>
          </ul>
        </div>
      )
    },
  }), [t, language]);

  const LEGAL_CONTENT = useMemo(() => (
    <div className={`space-y-4 text-sm leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'} text-slate-600`}>
      <p>• {t('legal_usage')}</p>
      <p>• {t('legal_privacy')}</p>
      <p>• {t('legal_security')}</p>
    </div>
  ), [t, language]);

  // --- منطق المساعد الذكي (Chatbot) ---
  const [chatMsg, setChatMsg] = useState("");
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const handleChat = async () => {
    if (!chatMsg.trim()) return;
    setIsBotTyping(true);
    setChatResponse(null);

    // محاكاة تفكير البوت بنوع بيانات صريح
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));

    const msg = chatMsg.toLowerCase();
    let response = t('bot_fallback');

    if (msg.includes("سعر") || msg.includes("رخيص") || msg.includes("مليون")) {
      response = t('bot_price_info');
    } else if (msg.includes("حجز") || msg.includes("نشوف") || msg.includes("تجربة")) {
      response = t('bot_booking_info');
    } else if (msg.includes("سلام") || msg.includes("مرحبا")) {
      response = t('bot_greeting');
    }

    setChatResponse(response);
    setIsBotTyping(false);
    toast.success(t('bot_new_message'), { position: language === 'ar' ? 'bottom-right' : 'bottom-left' });
  };

  // حالات الاتصال بنا
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // تحديث البحث تلقائياً مع تأخير (Debounce) بمقدار 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // استخدام دالة البحث بدلاً من الجلب العادي
  const carsQueryResult = useQuery(api.cars.searchCars, { 
    searchTerm: debouncedSearchQuery, 
    make: selectedMake === "كل الماركات" || !selectedMake ? undefined : selectedMake,
    minPrice: priceRange.min > 0 ? priceRange.min : undefined,
    maxPrice: priceRange.max < 100000000 ? priceRange.max : undefined,
    location: selectedLocation === "كل الولايات" || !selectedLocation ? undefined : selectedLocation,
  });

  const cars = carsQueryResult as (CarType[] | undefined);

  // دالة البحث الفوري والنزول للنتائج
  const handleSearch = () => {
    setDebouncedSearchQuery(searchQuery);
    document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const heroMessages = useMemo(() => {
    return [
      t('heroMsg1'),
      `${t('heroMsg2')} ${settings?.showroomName || t('algeria')}`,
      t('heroMsg3')
    ];
  }, [settings, t]); // إضافة t كمdependency لحل تحذير exhaustive-deps

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
      navigate(`/inventory/${carId}`, { // Removed replace: true to allow back navigation
        state: { from: location.pathname, pendingCarId: carId, openBooking: true },
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
            <span>{t('futureDriving')}</span>
          </div>

          <h1 className="text-white text-5xl md:text-7xl font-black mb-10 h-48 flex items-center justify-center tracking-tighter leading-none bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            {typedText}
          </h1>
          
          <div className="mt-10 mb-10 flex justify-center">
            <button 
              onClick={() => navigate('/login')} // زر "ابدأ الآن"
              className="relative bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl overflow-hidden hover:bg-blue-700 transition-all flex items-center gap-3 shadow-2xl shadow-blue-500/40 active:scale-95 group"
            >
              {t('startNow')} <ArrowRight size={22} className={language === 'ar' ? "rotate-180" : ""} />
              {/* تأثير اللمعان الذهبي */}
              <span className="absolute inset-0 block bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 animate-shine" />
            </button>
          </div>

          {/* شريط البحث المطور - خلفية بيضاء لتباين مثالي */}
          <div className="bg-white/95 backdrop-blur-2xl p-4 rounded-[3rem] border border-slate-200 flex flex-col gap-4 max-w-5xl mx-auto shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-[2] bg-slate-100 rounded-[2rem] flex items-center px-6 py-4 border border-slate-200 focus-within:border-blue-500/50 transition-all">
                {cars === undefined ? (
                  <Loader2 className="text-blue-500 ml-4 animate-spin" size={24} />
                ) : (
                  <Search className="text-blue-500 ml-4" size={24} />
                )}
                <input 
                  type="text" 
                  placeholder="ابحث عن ماركة، موديل، سنة..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className={`bg-transparent outline-none w-full font-bold text-slate-900 placeholder:text-slate-400 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'} />
              </div>
              
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`p-4 rounded-[2rem] border transition-all flex items-center justify-center gap-3 font-black text-sm ${showAdvanced ? 'bg-blue-600 text-white border-blue-400 shadow-lg' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
              >
                <SlidersHorizontal size={20} />
                <span>{t('filter')}</span>
              </button>

              {(selectedMake || searchQuery || selectedLocation) && (
                <button 
                  onClick={() => { 
                    setSelectedMake(""); 
                    setSearchQuery(""); 
                    setSelectedLocation(""); 
                    setDebouncedSearchQuery("");
                  }}
                  className="p-4 rounded-[2rem] bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all flex items-center justify-center"
                  title="مسح الكل"
                >
                  <RefreshCcw size={20} />
                </button>
              )}

              <button 
                onClick={handleSearch}
                className="bg-blue-600 text-white px-12 py-4 rounded-[2rem] font-black text-lg hover:bg-blue-500 transition-all shadow-xl active:scale-95"
              >
                {t('search')}
              </button>
            </div>

            {/* الفلاتر المتقدمة - ريقله في الألوان */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 overflow-hidden"
                >
                  <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                      <MapPin size={14} /> الولاية
                    </div>
                    <select 
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className={`w-full bg-transparent outline-none font-bold text-slate-900 appearance-none ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    >
                      <option value="">{t('all_locations')}</option>
                      <option value="Alger">{t('algiers')}</option>
                      <option value="Oran">{t('oran')}</option>
                      <option value="Blida">{t('blida')}</option>
                      <option value="Sétif">{t('setif')}</option>
                    </select>
                  </div>

                  <div className={`bg-slate-50 rounded-[2rem] p-5 border border-slate-200 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className={`flex flex-col ${language === 'ar' ? 'items-start' : 'items-end'}`}>
                        <span className="text-slate-900 font-black text-sm">
                          {priceRange.min >= 10000000 ? (priceRange.min / 10000000).toFixed(1) + (language === 'ar' ? " مليار" : " Mrd") : (priceRange.min / 1000000).toFixed(1) + (language === 'ar' ? " مليون" : " Mln")} {t('dzd')}
                        </span>
                        <span className="text-blue-600 font-bold text-[9px]">≈ {(priceRange.min / 10000).toLocaleString()} {t('centimes')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                        <TrendingDown size={14} /> السعر الأدنى
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100000000" 
                      step="500000"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="w-full accent-blue-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className={`bg-slate-50 rounded-[2rem] p-5 border border-slate-200 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className={`flex flex-col ${language === 'ar' ? 'items-start' : 'items-end'}`}>
                        <span className="text-slate-900 font-black text-sm">
                           {priceRange.max >= 10000000 ? (priceRange.max / 10000000).toFixed(1) + (language === 'ar' ? " مليار" : " Mrd") : (priceRange.max / 1000000).toFixed(1) + (language === 'ar' ? " مليون" : " Mln")} {t('dzd')}
                        </span>
                        <span className="text-amber-600 font-bold text-[9px]">≈ {(priceRange.max / 10000).toLocaleString()} {t('centimes')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                        <TrendingUp size={14} /> السعر الأقصى
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="1000000" 
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
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('explore')}</span>
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
              <div 
                key={i} 
                onClick={() => {
                  setSelectedMake(brand.name);
                  document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-all grayscale hover:grayscale-0 cursor-pointer hover:scale-110 active:scale-95 group/brand"
              >
                <img 
                  src={`https://cdn.simpleicons.org/${brand.slug}/black`} 
                  alt={brand.name} 
                  className="h-12 w-12 object-contain transition-transform group-hover/brand:rotate-12" 
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src = 'https://cdn.simpleicons.org/simpleicons/black'; 
                  }}
                />
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
        id="inventory-section"
        className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="w-20 h-1 bg-blue-600 mb-6 rounded-full" />
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">{t('luxuryFleet')}</h2>
            <p className="text-slate-500 font-bold mb-8 max-w-xl italic">{t('luxury_fleet_desc')}</p>
            
            <button 
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-2 text-amber-500 font-black hover:text-amber-600 transition-all group mb-12"
            >
              <span>{t('all_cars')}</span>
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cars === undefined ? (
              // عرض هياكل تحميل احترافية أثناء الجلب
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-[450px] bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] animate-pulse" />
              ))
            ) : cars.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold italic">
                لم نجد سيارات تطابق بحثك حالياً.. جرب كلمات أخرى
              </div>
            ) : (
              cars.slice(0, 8).map((car: CarType) => (
                <CarCard key={car._id} car={car} />
              ))
            )}
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
      >
        <div className="max-w-7xl mx-auto">
          <div className={`flex flex-col md:flex-row justify-between items-end mb-16 gap-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">{t('latestAdditions')} <span className="text-blue-600">🔥</span></h2>
              <p className="text-slate-500 font-bold italic">{t('latest_additions_desc')}</p>
            </div>
            <button 
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-2 text-slate-900 dark:text-white font-black group hover:text-amber-500 transition-all"
            >
              <span>{t('viewFullInventory')}</span>
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

      {/* 4. قسم من نحن (About Us) المترجم */}
      <AboutUsSection />

      {/* 5. قسم المساعد الذكي (Chatbot) المترجم */}
      <section id="chatbot-section" className="py-24 bg-slate-900 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:40px_40px]" />
         </div>
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-blue-500/40 animate-bounce">
               <MessageSquare size={40} />
            </div>
            <h2 className="text-4xl font-black text-white mb-6">{t('bot_title')} <br/> <span className="text-blue-400 text-2xl">{t('bot_subtitle')}</span></h2>
            
            <AnimatePresence>
               {chatResponse && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                   className={`bg-blue-600 text-white p-6 rounded-3xl mb-8 font-bold shadow-2xl relative ${language === 'ar' ? 'text-right' : 'text-left'}`}
                 >
                    <div className={`absolute -bottom-2 w-4 h-4 bg-blue-600 rotate-45 ${language === 'ar' ? 'right-10' : 'left-10'}`} />
                    {chatResponse}
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="bg-white/5 backdrop-blur-xl p-4 md:p-8 rounded-[3rem] border border-white/10 flex flex-col md:flex-row gap-4 items-center shadow-2xl">
               <div className="flex-1 w-full relative">
                  <Search className={`absolute top-1/2 -translate-y-1/2 text-blue-400 ${language === 'ar' ? 'right-4' : 'left-4'}`} size={20} />
                  <input 
                    type="text" 
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder={t('bot_placeholder')} 
                    className={`w-full bg-white/10 p-5 rounded-[2rem] outline-none text-white font-bold placeholder:text-slate-500 border border-transparent focus:border-blue-500/50 transition-all ${language === 'ar' ? 'pr-12 text-right' : 'pl-12 text-left'}`}
                  />
               </div>
               <button 
                onClick={handleChat}
                disabled={isBotTyping}
                className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-xl hover:bg-blue-500 transition-all whitespace-nowrap active:scale-95 disabled:opacity-50 flex items-center gap-2"
               >
                  {isBotTyping ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                  {isBotTyping ? t('thinking') : t('start_consultation')}
               </button>
            </div>
         </div>
      </section>

      {/* 6. قسم التشويق: اكتشف تجربة MOTORIX الفريدة */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-slate-950 py-24 text-center" 
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6">
            {t('whyMotorix').replace('موتوريكس', settings?.showroomName || "MOTORIX")}
          </h2>
          <p className="text-slate-500 font-bold mb-16 max-w-2xl mx-auto text-lg">{t('why_motorix_subtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-10">
            {[
              { icon: Rocket, title: t('feat_speed_title'), description: t('feat_speed_desc') },
              { icon: ShieldCheck, title: t('feat_trust_title'), description: t('feat_trust_desc') },
              { icon: Users, title: t('feat_service_title'), description: t('feat_service_desc') },
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

      {/* Footer المطور بالكامل ليدعم تعدد اللغات وفتح الروابط */}
      <footer className={`relative bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-black text-slate-900 dark:text-white pt-32 pb-12 px-6 border-t-8 border-blue-600 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
          {t('footer_badge')}
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            {/* Column 1: Brand */}
            <div className={`space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
               <div className="flex items-center gap-2 mb-6">
                  {logoImageUrl ? <img src={logoImageUrl} alt="Logo" className="w-10 h-10 object-contain" /> : <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><Zap size={24} className="fill-white" /></div>}
                  <span className="text-2xl font-black tracking-tighter uppercase">{settings?.showroomName || "MOTORIX"}</span>
               </div>
               <p className="text-slate-500 font-bold text-sm leading-relaxed">{t('footer_brand_desc')}</p>
               <div className={`flex gap-4 pt-4 ${language === 'ar' ? 'justify-start' : 'justify-start md:justify-start'}`}>
                  <a href="https://www.facebook.com/share/18PQwdwTkR/" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg border border-slate-100 dark:border-white/10 group"><Facebook size={20} className="group-hover:scale-110 transition-transform" /></a>
                  <a href="#" className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-lg border border-slate-100 dark:border-white/10 group"><Users size={20} className="group-hover:scale-110 transition-transform" /></a>
               </div>
            </div>

            {/* Column 2: Help Center */}
            <div className={`space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
               <h4 className="font-black text-blue-600 flex items-center gap-2"><HelpCircle size={18} /> {t('help_center')}</h4>
               <ul className="space-y-4">
                  <FooterLink label={t('how_to_book')} onClick={() => setHelpModal({ ...HELP_DATA.booking, isOpen: true })} />
                  <FooterLink label={t('finance_terms')} onClick={() => setHelpModal({ ...HELP_DATA.finance, isOpen: true })} />
                  <FooterLink label={t('motorix_guarantee')} onClick={() => setHelpModal({ ...HELP_DATA.booking, isOpen: true })} />
                  <FooterLink label={t('faq')} onClick={() => setHelpModal({ ...HELP_DATA.booking, isOpen: true })} />
               </ul>
            </div>

            {/* Column 3: Support */}
            <div className={`space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
               <h4 className="font-black text-emerald-500 flex items-center gap-2"><Shield size={18} /> {t('support_policies')}</h4>
               <ul className="space-y-4">
                  <FooterLink label={t('privacy_policy')} onClick={() => setHelpModal({ title: t('privacy_policy'), content: LEGAL_CONTENT, isOpen: true })} />
                  <FooterLink label={t('terms_of_use')} onClick={() => setHelpModal({ title: t('terms_of_use'), content: LEGAL_CONTENT, isOpen: true })} />
                  <FooterLink label={t('after_sales')} onClick={() => setHelpModal({ ...HELP_DATA.booking, isOpen: true })} />
                  <FooterLink label={t('make_complaint')} onClick={() => setHelpModal({ ...HELP_DATA.booking, isOpen: true })} />
               </ul>
            </div>

            {/* Column 4: Contact & Message */}
            <div className={`space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
               <h4 className="font-black text-rose-500 flex items-center gap-2">{t('contact_us')}</h4>
               <div className={`space-y-4 bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-inner ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  <a href={`tel:${settings?.contactPhone || '0659618904'}`} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-black text-sm hover:text-blue-600 transition-colors">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600"><Phone size={16} /></div> 
                    {settings?.contactPhone || "0659618904"}
                  </a>
               </div>
               
               <div className="pt-4">
                  <div className="bg-white dark:bg-white/5 p-2 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center gap-2 group focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm">
                     <input 
                        type="text" 
                        placeholder={t('leave_message_placeholder')} 
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className={`flex-1 bg-transparent outline-none text-xs font-bold p-2 ${language === 'ar' ? 'text-right' : 'text-left'}`} 
                     />
                     <button 
                        onClick={async () => {
                          if(!contactForm.message) return;
                          setIsSendingMsg(true);
                          await new Promise<void>((resolve) => setTimeout(resolve, 800));
                          toast.success(t('message_sent_success'));
                          setContactForm({ ...contactForm, message: '' });
                          setIsSendingMsg(false);
                        }}
                        disabled={isSendingMsg}
                        className="p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 min-w-[36px] flex items-center justify-center"
                     >
                        {isSendingMsg ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                     </button>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className={`flex items-center gap-3 text-slate-400 bg-white/5 px-6 py-3 rounded-full border border-white/10 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
              <ShieldAlert size={20} className="text-amber-500" />
              <p className="text-sm font-bold">{t('security_tip')}</p>
            </div>
            <p className="text-slate-500 font-black text-xs uppercase tracking-widest">© {new Date().getFullYear()} {settings?.showroomName || "MOTORIX"}. {t('copyright_system')}</p>
          </div>
        </div>
      </footer>

      {/* مودال المحتوى المطور (Help/Policy Modal) */}
      <AnimatePresence>
        {helpModal?.isOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md" onClick={() => setHelpModal(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border-t-[10px] border-blue-600 overflow-hidden relative"
            >
              <button onClick={() => setHelpModal(null)} className="absolute top-6 left-6 p-2 bg-slate-50 dark:bg-white/5 rounded-full text-slate-400 hover:text-rose-500 transition-all"><X size={20}/></button>
              <div className="p-10">
                <div className="flex items-center gap-3 mb-6 text-blue-600">
                  <FileCheck size={28} />
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">{helpModal.title}</h3>
                </div>
                <div className="text-lg leading-relaxed dark:text-slate-300">
                  {helpModal.content}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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