import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  MapPin, 
  ShieldAlert, 
  Zap, 
  ArrowRight, 
  ChevronDown, Rocket, ShieldCheck, Users
} from 'lucide-react';
import { CarType } from '../features/cars/types/car.types';
import { Id } from '../../convex/_generated/dataModel';
import CarCard from '../components/CarCard'; // استيراد مكون CarCard العام

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // جلب إعدادات الموقع
  const settings = useQuery(api.site_settings.getSettings);
  const logoImageUrl = useQuery(
    api.files.getImageUrl,
    settings?.logoImageId ? { storageId: settings.logoImageId as Id<"_storage"> } : "skip"
  );
  const reserveCar = useMutation(api.bookings.reserveCar);
  const token = localStorage.getItem("convex_token") || "";
  // تم إزالة reservingId لعدم استخدامه في العرض

  const [typedText, setTypedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleReserve = useCallback(async (carId: Id<"cars">) => {
    if (!token) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return navigate('/login', { state: { from: location.pathname, pendingCarId: carId } });
    }
    
    try {
      await reserveCar({ token, carId });
      toast.success("رائع! تم تسجيل طلب حجزك. تفقد حسابك لمتابعة التحديثات.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الحجز.");
    }
  }, [token, navigate, location.pathname, reserveCar]);

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
      // تنظيف الحالة من الرابط لمنع التكرار عند تحديث الصفحة
      navigate(location.pathname, { replace: true, state: {} });
      handleReserve(carId);
    }
  }, [token, location.state, navigate, location.pathname, handleReserve]);

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
            <Zap size={14} />
            <span>The Future of Driving is Here</span>
          </div>

          <h1 className="text-white text-5xl md:text-7xl font-black mb-10 h-48 flex items-center justify-center tracking-tighter leading-none bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            {typedText}
          </h1>
          
          <div className="mt-10 mb-10 flex justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all flex items-center gap-3 shadow-2xl shadow-blue-500/40 active:scale-95"
            >
              ابدأ الآن <ArrowRight size={22} className="rotate-180" />
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/20 flex flex-col md:flex-row gap-2 max-w-4xl mx-auto shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex-[2] bg-white/50 backdrop-blur-sm rounded-[2rem] flex items-center px-6 py-4 border border-white/30">
              <Search className="text-blue-600 ml-4" size={24} />
              <input 
                type="text" 
                placeholder="ابحث عن ماركة، موديل..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full font-bold text-slate-800 placeholder:text-slate-500 text-right" dir="rtl" />
            </div>
            <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-[2rem] flex items-center px-6 py-4 border border-white/30">
              <MapPin className="text-blue-600 ml-4" size={24} />
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent outline-none w-full font-bold text-slate-800 appearance-none text-right" dir="rtl"
              >
                <option>كل الولايات</option>
                <option value="Alger">الجزائر العاصمة</option>
                <option value="Oran">وهران</option>
                <option value="Blida">البليدة</option>
                <option value="Sétif">سطيف</option>
                {/* يمكنك إضافة المزيد من الولايات هنا */}
              </select>
            </div>
            <button className="bg-blue-600 text-white px-10 py-4 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 active:scale-95">
              بحث
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce flex flex-col items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Explore</span>
          <ChevronDown size={20} />
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="bg-white dark:bg-slate-900 py-24 text-center" dir="rtl">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6">
            لماذا تختار <span className="text-blue-600">{settings?.showroomName || "موتوريكس"}</span>؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            {[
              { icon: Rocket, title: "سرعة الأداء", description: "اعثر على سيارتك المثالية وتصفح أفضل العروض في وقت قياسي بفضل نظامنا الفعال." },
              { icon: ShieldCheck, title: "أمان وموثوقية", description: "نضمن لك تعاملات آمنة وموثوقة، مع حماية كاملة لبياناتك الشخصية ومالك." },
              { icon: Users, title: "دعم مخصص", description: "فريق دعم متاح لمساعدتك في كل خطوة، من البحث وحتى إتمام الصفقة." },
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-700 transform hover:-translate-y-2">
                <div className="p-5 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 inline-block mb-6">
                  <feature.icon size={36} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Listings Section */}
      <section className="bg-[#f8f9fd] dark:bg-slate-950 py-24 px-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-2 text-right">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">آخر الإعلانات</h2>
              <p className="text-slate-500 font-bold">اكتشف أحدث السيارات المضافة في معرضنا</p>
            </div>
            <button className="flex items-center gap-2 text-blue-600 font-black group">
              <span>عرض كل العروض</span>
              <ArrowRight size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {cars?.map((car) => (
              <CarCard key={car._id} car={car as CarType} />
            ))}
          </div>
        </div>
      </section>

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
      ` }} />
    </div>
  );
};
export default LandingPage;