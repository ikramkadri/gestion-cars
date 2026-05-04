import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, ShieldAlert, Zap, ArrowRight, ChevronDown, LayoutDashboard, Rocket, ShieldCheck, Users, MessageSquare, DollarSign, Quote } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';
import CarCard from '../components/CarCard';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from 'react-router-dom';
import { CarType } from '../features/cars/types/car.types'; // Import CarType

const LandingPage = () => {
  const { t } = useLang();
  const [typedText, setTypedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const navigate = useNavigate();
  // حالات البحث
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMake] = useState<string | undefined>(undefined);

  // جلب البيانات بشكل صحيح (يجب استدعاء الـ Hooks دائماً وبدون شروط)
  const latestCars = useQuery(api.cars.getCars, { status: "Available" }) as CarType[] | undefined;
  const searchResults = useQuery(api.cars.searchCars, { searchTerm: searchQuery, make: selectedMake }) as CarType[] | undefined;

  const displayCars = searchQuery ? searchResults : latestCars;

  // تأمين المصفوفة لتجنب انهيار التطبيق إذا كانت الترجمة مفقودة أو ليست مصفوفة
  const heroMessages = useMemo(() => {
    const rawMessages = t('heroMessages');
    return Array.isArray(rawMessages) && rawMessages.length > 0 
      ? rawMessages 
      : ["اعثر على سيارة أحلامك", "سوق السيارات الأول", "بيع واشتري بضمان"];
  }, [t]);

  useEffect(() => {
    if (heroMessages.length === 0) return;
    
    const handleTyping = () => {
      const currentMessage = heroMessages[textIndex];
      if (!currentMessage) return;

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

  return (
    <div className="bg-[#050505] dark:bg-slate-950 transition-colors duration-500 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0">
          {/* صورة السيارة الفخمة مع حركة الزوم الهادئة */}
          <img 
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070" 
            className="w-full h-full object-cover opacity-50 scale-105 animate-[subtle-zoom_20s_infinite]" 
            alt="hero" 
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
          
          {/* Hero Actions */}
          <div className="mt-10 mb-10 flex flex-wrap justify-center gap-4">
            {/* The App.tsx routing now handles redirection based on token presence */}
            <button 
              onClick={() => navigate("/login")} // This will redirect to /admin if token exists
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
            >
              ابدأ الآن <ArrowRight size={20} className="rotate-180" />
            </button>
            <button 
              onClick={() => navigate("/admin")}
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-lg hover:bg-white/20 transition-all flex items-center gap-2 shadow-xl"
            >
              لوحة التحكم <LayoutDashboard size={20} />
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/20 flex flex-col md:flex-row gap-2 max-w-4xl mx-auto shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex-[2] bg-white/50 backdrop-blur-sm rounded-[2rem] flex items-center px-6 py-4 border border-white/30">
              <Search className="text-blue-600 ml-4" size={24} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full font-bold text-slate-800 placeholder:text-slate-500" />
            </div>
            <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-[2rem] flex items-center px-6 py-4 border border-white/30">
              <MapPin className="text-blue-600 ml-4" size={24} />
              <select className="bg-transparent outline-none w-full font-bold text-slate-800 appearance-none">
                <option>كل الولايات</option>
              </select>
            </div>
            <button className="bg-blue-600 text-white px-10 py-4 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 active:scale-95">
              بحث
            </button>
          </div>
        </div>

        {/* سهم النزول للأسفل */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce flex flex-col items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Explore</span>
          <ChevronDown size={20} />
        </div>
      </section>

      {/* لماذا تختار موتوريكس؟ - Why Choose Motorix Section */}
      <section className="bg-white dark:bg-slate-900 py-24 text-center" dir="rtl">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6">
            لماذا تختار <span className="text-blue-600">موتوريكس</span>؟
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto leading-relaxed">
            نقدم لك تجربة فريدة في عالم شراء وبيع السيارات، تجمع بين السهولة، الأمان، والتنوع.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Rocket, title: "سرعة الأداء", description: "اعثر على سيارتك المثالية أو بِع سيارتك في وقت قياسي بفضل نظامنا الفعال." },
              { icon: ShieldCheck, title: "أمان وموثوقية", description: "نضمن لك تعاملات آمنة وموثوقة، مع حماية كاملة لبياناتك الشخصية ومالك." },
              { icon: Users, title: "دعم مخصص", description: "فريق دعم متاح لمساعدتك في كل خطوة، من البحث وحتى إتمام الصفقة." },
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 transform hover:-translate-y-2">
                <div className="p-5 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 inline-block mb-6">
                  <feature.icon size={36} strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* آخر الإعلانات - Latest Listings Section */}
      <section className="bg-[#f8f9fd] dark:bg-slate-950 py-24 px-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">آخر الإعلانات</h2>
            <div className="flex gap-4">
              <button className="text-blue-600 font-bold border-b-4 border-blue-600 pb-1 hover:text-blue-700 transition-colors">سيارات مستعملة</button>
              <button className="text-slate-400 font-bold hover:text-slate-600 transition-colors">سيارات جديدة (00 كم)</button>
            </div>
          </div>
          <button className="flex items-center gap-2 text-blue-600 font-black group">
            <span>عرض كل العروض</span>
            <ArrowRight size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* الكروت موزعة في شبكة احترافية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">
          {displayCars?.map((car: CarType) => ( // Explicitly type car as CarType
            <CarCard key={car._id} car={car} /> 
          ))}
        </div>
        </div>
      </section>

      {/* كيف يعمل موتوريكس؟ - How It Works Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24" dir="rtl">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-6">
            كيف يعمل <span className="text-white">موتوريكس</span>؟
          </h2>
          <p className="text-lg text-blue-100 mb-16 max-w-2xl mx-auto leading-relaxed">
            عملية بسيطة وخطوات واضحة لتجد سيارتك أو تبيعها بكل سهولة ويسر.
          </p>

          <div className="relative flex flex-col md:flex-row justify-between items-center space-y-12 md:space-y-0">
            {/* Step 1 */}
            <div className="flex flex-col items-center max-w-xs group">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-xl border border-white/20 shadow-xl group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                <Search size={36} />
              </div>
              <h3 className="text-2xl font-black mb-3">1. ابحث</h3>
              <p className="text-blue-100 font-bold opacity-80 leading-relaxed">تصفح آلاف السيارات من مختلف الماركات والموديلات بضغطة زر واحدة.</p>
            </div>
            
            <div className="hidden md:block w-16 h-0.5 bg-gradient-to-l from-white/0 via-white/20 to-white/0" />

            {/* Step 2 */}
            <div className="flex flex-col items-center max-w-xs group">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-xl border border-white/20 shadow-xl group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                <MessageSquare size={36} />
              </div>
              <h3 className="text-2xl font-black mb-3">2. تواصل</h3>
              <p className="text-blue-100 font-bold opacity-80 leading-relaxed">تحدث مباشرة مع البائعين، استفسر عن التفاصيل، واحجز موعد المعاينة.</p>
            </div>

            <div className="hidden md:block w-16 h-0.5 bg-gradient-to-l from-white/0 via-white/20 to-white/0" />

            {/* Step 3 */}
            <div className="flex flex-col items-center max-w-xs group">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-xl border border-white/20 shadow-xl group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                <DollarSign size={36} />
              </div>
              <h3 className="text-2xl font-black mb-3">3. اشترِ</h3>
              <p className="text-blue-100 font-bold opacity-80 leading-relaxed">اتمم صفقة الشراء بأمان وثقة تامة، وانطلق بسيارة أحلامك الجديدة.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - آراء العملاء */}
      <section className="bg-white dark:bg-slate-900 py-32 px-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">ماذا يقول <span className="text-blue-600">عملاؤنا</span>؟</h2>
            <p className="text-slate-500 font-bold max-w-2xl mx-auto">نفخر بخدمة آلاف العملاء يومياً وتوفير أفضل تجربة بيع وشراء سيارات في المنطقة.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "سفيان بن علي", role: "مشترٍ", text: "موقع رائع جداً، وجدت السيارة التي كنت أبحث عنها في غضون يومين فقط. التواصل مع البائع كان سهلاً وسلساً." },
              { name: "ليلى محمود", role: "بائع", text: "قمت ببيع سيارتي عبر موتوريكس في وقت قياسي. نظام عرض الإعلانات احترافي جداً ويصل للجمهور المستهدف." },
              { name: "ياسين قادري", role: "مشترٍ", text: "أكثر ما أعجبني هو تنوع الخيارات وسهولة البحث. الموقع يوفر كل التفاصيل التي يحتاجها المشتري لاتخاذ القرار." },
            ].map((testimonial, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 relative group hover:shadow-2xl transition-all duration-500">
                <Quote className="absolute top-8 left-8 text-blue-600/10 w-16 h-16" />
                <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed mb-8 relative z-10 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                    {testimonial.name[0]}
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-slate-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-xs text-blue-600 font-black uppercase tracking-widest">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-24 pb-12 px-6 border-t border-white/5" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-right">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6 justify-end md:justify-start">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap size={24} className="fill-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter">MOTOR<span className="text-blue-500">IX</span></span>
              </div>
              <p className="text-slate-500 font-bold max-w-sm leading-relaxed">المنصة الرائدة في المنطقة لبيع وشراء السيارات بأمان وثقة. نحن نسعى لتطوير سوق السيارات الرقمي وتقديم أفضل تجربة للمستخدمين.</p>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6">روابط سريعة</h4>
              <ul className="space-y-4 text-slate-400 font-bold text-sm">
                <li><a href="#" className="hover:text-blue-500 transition-colors">عن موتوريكس</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">أحدث الإعلانات</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">تواصل معنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6">الدعم</h4>
              <ul className="space-y-4 text-slate-400 font-bold text-sm">
                <li><a href="#" className="hover:text-blue-500 transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">شروط الاستخدام</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center justify-center gap-3 text-slate-400 bg-white/5 backdrop-blur-sm px-8 py-4 rounded-full border border-white/10 shadow-sm max-w-2xl">
              <ShieldAlert size={20} className="text-amber-500" />
              <p className="text-sm font-bold italic">نصيحة أمان: تأكد دائماً من معاينة السيارة شخصياً قبل دفع أي مبالغ مالية.</p>
            </div>
            <p className="text-slate-500 font-bold text-sm">© 2024 MOTORIX. جميع الحقوق محفوظة.</p>
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