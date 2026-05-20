import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Gauge, Fuel, Settings, MapPin, Hash, ShieldCheck, Zap, Award, Info, DollarSign,
  Phone, MessageCircle, CalendarCheck, Heart, Share2, User, Star, ChevronLeft, ChevronRight, X, Send, Palette, Globe, Languages, FileText, Car, Sun, Moon
} from 'lucide-react';
import { CarType } from '../features/cars/types/car.types';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../lib/LanguageContext';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // "العفسة الذكية": ترجمة الولايات بناءً على الرقم التسلسلي
  const translateLocation = useCallback((loc: string, currentLang: string) => {
    // استخراج رقم الولاية من النص (مثلاً "01 - أدرار" تصبح "01")
    const stateCode = loc.split(' - ')[0];
    
    const statesMap: Record<string, Record<string, string>> = {
      '01': { ar: 'أدرار', fr: 'Adrar', en: 'Adrar' },
      '09': { ar: 'البليدة', fr: 'Blida', en: 'Blida' },
      '16': { ar: 'الجزائر', fr: 'Alger', en: 'Algiers' },
      '19': { ar: 'سطيف', fr: 'Sétif', en: 'Setif' },
      '31': { ar: 'وهران', fr: 'Oran', en: 'Oran' },
      // يمكنك إضافة البقية هنا بنفس النمط
    };

    return statesMap[stateCode]?.[currentLang] || loc;
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLang();
  
  const allImages = useMemo(() => [car.mainImageUrl, ...(car.imagesUrls || [])].filter(Boolean) as string[], [car]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // حالات نموذج الحجز السريع (Lead Form)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    phone: '',
    location: '',
    inspectionDate: '',
    inspectionTimeSlot: '', // 'morning' | 'evening'
    inspectionHour: '', // '09:00' | '10:00' etc.
    message: ''
  });

  // توليد أيام العمل المقترحة (الأحد - الخميس)
  const availableDates = useMemo(() => {
    const days = [];
    const today = new Date();
    let offset = 1; // البدء من الغد

    while (days.length < 6) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      const dayOfWeek = date.getDay(); // 0: الأحد, 5: الجمعة, 6: السبت
      
      // استبعاد الجمعة والسبت
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        days.push(new Date(date));
      }
      offset++;
    }
    return days;
  }, []);

  // تحديد ساعات العمل
  const MORNING_HOURS = ['09:00', '10:00', '11:00'];
  const EVENING_HOURS = ['14:00', '15:00', '16:00'];

  useEffect(() => {
    if (availableDates.length > 0 && !bookingForm.inspectionDate) {
      setBookingForm(prev => ({ ...prev, inspectionDate: availableDates[0].toISOString().split('T')[0] }));
    }
  }, [availableDates, bookingForm.inspectionDate]);

  const token = localStorage.getItem("convex_token") || "";
  const user = useQuery(api.users.viewer, token ? { token } : "skip");
  
  const toggleFavorite = useMutation(api.favorites.toggleFavorite);
  const carFavoriteCount = useQuery(api.favorites.getCarFavoriteCount, { carId: car._id }); // جلب عدد الإعجابات
  const myFavorites = useQuery(api.favorites.getMyFavorites, token ? { token } : "skip");
  const reserveCar = useMutation(api.bookings.reserveCar);

  // التحقق مما إذا كانت السيارة موجودة مسبقاً في مفضلة المستخدم
  const isFavorited = useMemo(() => {
    return myFavorites?.some(fav => fav?._id === car._id) ?? false;
  }, [myFavorites, car._id]);

  const isHex = (color?: string) => color && /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color);
  const accentColor = isHex(car.color) ? car.color : '#2563eb';
  const goldColor = '#D4AF37';

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = useCallback((newDirection: number) => {
    const nextIndex = (activeIndex + newDirection + allImages.length) % allImages.length;
    setDirection(newDirection);
    setActiveIndex(nextIndex);
  }, [activeIndex, allImages.length]);

  // 1. تعريف القاموس أولاً (Translations Dictionary)
  const translations = {
    ar: {
      priceTitle: 'السعر النهائي المقترح',
      currency: 'مليون دج',
      specsTitle: 'المواصفات التقنية',
      descTitle: 'وصف المركبة بالتفصيل',
      vinLabel: 'رقم الهيكل',
      warranty: 'فحص معتمد',
      seller: 'مستشار المبيعات',
      security: 'سياسة الأمان: جميع بيانات هذه السيارة موثقة ومضمونة قانونياً من قبل المعرض.',
      call: 'اتصال',
      whatsapp: 'واتساب',
      viewing: 'احجز موعد معاينة',
      new: 'حصري',
      used: 'نخبة المستعمل',
      similar: 'مركبات مشابهة قد تثير اهتمامك',
      all: 'عرض الكل',
      bookingTitle: 'اطلب موعد معاينة',
      calcBtn: 'احسب أقساطك البنكية',
      translateBtn: 'ترجمة الوصف آلياً',
      share: 'مشاركة',
      colorLabel: 'اللون الخارجي',
      originLabel: 'المنشأ / الوارد',
      submit: 'إرسال الطلب الآن',
      phoneLabel: 'رقم الهاتف (ضروري)',
      locationLabel: 'الولاية',
      dateLabel: 'موعد المعاينة (اختياري)',
      timeSlotLabel: 'الفترة الزمنية',
      hourLabel: 'الساعة المحددة',
      morning: 'صباحاً',
      evening: 'مساءً',
      msgLabel: 'رسالة قصيرة',
      hint: 'بمجرد الإرسال، سنتصل بك في أقرب وقت.',
      conditionNew: 'حصري',
      conditionUsed: 'نخبة المستعمل',
      defaultDesc: 'مركبة فاخرة تم اختيارها بعناية من قبل خبراء موتوريكس لضمان أعلى معايير الجودة والأداء.'
    },
    fr: {
      priceTitle: 'PRIX FINAL PROPOSÉ',
      currency: 'Millions DA',
      specsTitle: 'Fiche Technique',
      descTitle: 'Description détaillée',
      vinLabel: 'N° de châssis',
      warranty: 'Certifié',
      seller: 'Conseiller Commercial',
      security: 'Politique de sécurité : Toutes les données de ce véhicule sont documentées.',
      call: 'Appeler',
      whatsapp: 'WhatsApp',
      viewing: 'Réserver un essai',
      new: 'Exclusif',
      used: 'Elite Occasion',
      similar: 'Véhicules similaires',
      all: 'Voir tout',
      bookingTitle: 'Prendre rendez-vous',
      calcBtn: 'Calculer le crédit',
      translateBtn: 'Traduire la description',
      share: 'Partager',
      colorLabel: 'Couleur Extérieure',
      originLabel: 'Origine',
      submit: 'Envoyer',
      phoneLabel: 'N° de téléphone',
      locationLabel: 'Wilaya',
      dateLabel: 'Date (optionnel)',
      timeSlotLabel: 'Période',
      hourLabel: 'Heure',
      morning: 'Matin',
      evening: 'Après-midi',
      msgLabel: 'Message',
      hint: 'Notre équipe vous contactera bientôt.',
      conditionNew: 'Exclusif',
      conditionUsed: 'Elite Occasion',
      defaultDesc: 'Un véhicule de luxe sélectionné avec soin par les experts de Motorix pour garantir les plus hauts standards de qualité.'
    },
    en: {
      priceTitle: 'PROPOSED FINAL PRICE',
      currency: 'Million DZD',
      specsTitle: 'Technical Specs',
      descTitle: 'Detailed Description',
      vinLabel: 'VIN',
      warranty: 'Certified',
      seller: 'Sales Advisor',
      security: 'Safety Policy: All vehicle data is documented and legally guaranteed.',
      call: 'Call',
      whatsapp: 'WhatsApp',
      viewing: 'Schedule Viewing',
      new: 'Exclusive',
      used: 'Elite Used',
      similar: 'Similar Vehicles',
      all: 'View All',
      bookingTitle: 'Schedule a Viewing',
      calcBtn: 'Calculate Finance',
      translateBtn: 'Translate Description',
      share: 'Share',
      colorLabel: 'Exterior Color',
      originLabel: 'Origin',
      submit: 'Send Request',
      phoneLabel: 'Phone Number',
      locationLabel: 'Location',
      dateLabel: 'Date (optional)',
      timeSlotLabel: 'Time Slot',
      hourLabel: 'Specific Hour',
      morning: 'Morning',
      evening: 'Evening',
      msgLabel: 'Message',
      hint: 'We will contact you as soon as possible.',
      conditionNew: 'Exclusive',
      conditionUsed: 'Elite Used',
      defaultDesc: 'A luxury vehicle carefully selected by Motorix experts to ensure the highest standards of quality and performance.'
    }
  };

  // 2. اختيار اللغة الحالية
  const ui = translations[lang as 'ar' | 'fr' | 'en'] || translations.ar;

  const specs = [
    { label: lang === 'ar' ? 'المسافة المقطوعة' : lang === 'fr' ? 'Kilométrage' : 'Mileage', value: `${car.mileage.toLocaleString()} ${lang === 'ar' ? 'كم' : 'KM'}`, icon: <Gauge size={22} /> },
    { label: lang === 'ar' ? 'سعة المحرك' : lang === 'fr' ? 'Moteur' : 'Engine', value: car.engineSize || 'N/A', icon: <Settings size={22} /> },
    { label: lang === 'ar' ? 'نوع الوقود' : lang === 'fr' ? 'Carburant' : 'Fuel', value: car.fuel === 'Gasoline' ? (lang === 'ar' ? 'بنزين' : 'Essence') : car.fuel === 'Diesel' ? (lang === 'ar' ? 'ديزل' : 'Diesel') : 'Electric', icon: <Fuel size={22} /> },
    { label: lang === 'ar' ? 'ناقل الحركة' : lang === 'fr' ? 'Transmission' : 'Transmission', value: car.transmission === 'Automatic' ? (lang === 'ar' ? 'أوتوماتيك' : 'Automatique') : (lang === 'ar' ? 'يدوي' : 'Manuel'), icon: <Zap size={22} /> },
    { label: lang === 'ar' ? 'نظام الدفع' : lang === 'fr' ? 'Traction' : 'Drivetrain', value: car.drivetrain || 'N/A', icon: <Award size={22} /> },
    { label: ui.colorLabel, value: car.color || 'N/A', icon: <Palette size={22} /> },
    { label: ui.originLabel, value: car.origin || 'N/A', icon: <Globe size={22} /> },
    { label: lang === 'ar' ? 'الأسطوانات' : lang === 'fr' ? 'Cylindres' : 'Cylinders', value: car.cylinders ? `${car.cylinders}V` : 'N/A', icon: <Info size={18} /> },
  ];

  useEffect(() => {
    if (token && location.state?.pendingCarId === car._id) {
      navigate(location.pathname, { replace: true, state: {} });
      if (user) {
        setTimeout(() => {
          setBookingForm(prev => ({
            ...prev,
            phone: user.phone || prev.phone,
            location: user.address || prev.location
          }));
          setIsBookingModalOpen(true);
        }, 0);
      }
    }
  }, [user, token, location.state, car._id, navigate, location.pathname]);

  // تنفيذ الحجز النهائي بعد إدخال البيانات
  const handleFinalBooking = async () => {
    if (!bookingForm.phone || !bookingForm.location || !bookingForm.inspectionDate || !bookingForm.inspectionHour) {
      return toast.error(lang === 'ar' ? "يرجى إدخال رقم الهاتف والولاية للمتابعة" : "Veuillez entrer le téléphone et la localisation");
    }

    const [year, month, day] = bookingForm.inspectionDate.split('-').map(Number);
    const [hour, minute] = bookingForm.inspectionHour.split(':').map(Number);
    const inspectionDateTime = new Date(year, month - 1, day, hour, minute).getTime(); // Convert to timestamp

    const toastId = toast.loading(lang === 'ar' ? "جاري إرسال طلبك..." : "Envoi en cours...");
    try {
      await reserveCar({
        carId: car._id as Id<"cars">,
        token,
        customerPhone: bookingForm.phone,
        customerLocation: bookingForm.location,
        inspectionDate: inspectionDateTime, // Pass the timestamp
        message: bookingForm.message,
        bookingSource: "website"
      });
      toast.success(lang === 'ar' ? "تم استلام طلبك! سنتصل بك قريباً." : "Demande reçue!", { id: toastId });
      setIsBookingModalOpen(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : (lang === 'ar' ? "حدث خطأ" : "Une erreur est survenue"), { id: toastId });
    }
  };

  return (
    <div className="bg-white dark:bg-[#050505] min-h-screen text-slate-900 dark:text-white font-sans overflow-x-hidden transition-colors duration-500" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Background Effect */}
      <div className="absolute top-0 right-0 w-[50%] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-12 lg:py-24 relative z-10">
        <div className="space-y-24">
          
          {/* TOP SECTION: الاسم جنب السيارة الكبيرة */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* 1. Gallery (9 Columns) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-8 space-y-6"
            >
              <div className="relative aspect-[16/9] rounded-[3rem] md:rounded-[4rem] overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-2xl group cursor-grab active:cursor-grabbing">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={activeIndex}
                    src={allImages[activeIndex]}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(_, { offset, velocity }) => {
                      const swipe = swipePower(offset.x, velocity.x);
                      if (swipe < -swipeConfidenceThreshold) paginate(1);
                      else if (swipe > swipeConfidenceThreshold) paginate(-1);
                    }}
                    className="absolute w-full h-full object-cover"
                    alt="Car Hero"
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                {/* Navigation Arrows */}
                <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-6 pointer-events-none">
                  <button 
                    onClick={() => paginate(-1)}
                    className="p-4 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white border border-white/20 transition-all pointer-events-auto shadow-2xl"
                  >
                    {lang === 'ar' ? <ChevronRight size={28} /> : <ChevronLeft size={28} />}
                  </button>
                  <button 
                    onClick={() => paginate(1)}
                    className="p-4 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white border border-white/20 transition-all pointer-events-auto shadow-2xl"
                  >
                    {lang === 'ar' ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
                  </button>
                </div>
                
                {/* Floating Actions on Image */}
                <div className="absolute top-8 left-8 flex gap-3">
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!token) {
                        toast.error(lang === 'ar' ? "يرجى تسجيل الدخول للإضافة للمفضلة" : "Veuillez vous connecter pour ajouter aux favoris");
                        return navigate('/login', { state: { from: location.pathname } });
                      }
                      try {
                        await toggleFavorite({ carId: car._id as Id<"cars">, token });
                      } catch {
                        toast.error(lang === 'ar' ? "حدث خطأ أثناء تحديث المفضلة" : "Erreur lors de la mise à jour des favoris");
                      }
                    }}
                    className={`p-4 rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-90 ${isFavorited ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'bg-white/20 dark:bg-white/5 text-white hover:bg-white/30 dark:hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-1">
                      <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
                      <span className="text-sm font-bold">{carFavoriteCount !== undefined ? carFavoriteCount : '-'}</span>
                    </div>
                  </button>
                  <button 
                    onClick={async () => {
                      const shareData = {
                        title: `${car.make} ${car.model} - MOTORIX`,
                        text: lang === 'ar' 
                          ? `شاهد هذه السيارة الرائعة: ${car.make} ${car.model} موديل ${car.year}`
                          : `Découvrez cette superbe voiture: ${car.make} ${car.model} (${car.year})`,
                        url: window.location.href,
                      };

                      if (navigator.share) {
                        try {
                          await navigator.share(shareData);
                        } catch (error: unknown) {
                          console.log('Sharing failed', error);
                        }
                      } else {
                        // Fallback: Copy link to clipboard
                        navigator.clipboard.writeText(window.location.href);
                        toast.success(lang === 'ar' ? "تم نسخ الرابط بنجاح!" : "Lien copié !");
                      }
                    }}
                    className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    <Share2 size={20} />
                  </button>
                </div>

                <div className="absolute bottom-8 right-8">
                   <span className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">
                     <ShieldCheck className="text-emerald-400" size={16} /> {ui.warranty}
                   </span>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {allImages.map((url, i) => (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={i}
                    onClick={() => {
                      setDirection(i > activeIndex ? 1 : -1);
                      setActiveIndex(i);
                    }}
                    className={`aspect-square h-20 md:h-24 shrink-0 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden cursor-pointer border-2 transition-all ${activeIndex === i ? 'border-blue-500 shadow-lg shadow-blue-500/20 opacity-100' : 'border-slate-200 dark:border-white/5 opacity-40 hover:opacity-100'}`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 2. Car Identity (4 Columns) - "الاسم جنب السيارة" */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-8">
               <motion.div 
                 initial={{ opacity: 0, x: lang === 'ar' ? 50 : -50 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="space-y-6"
               >
                  <div className="flex items-center gap-3">
                    <span className="px-5 py-2 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                      {car.condition === 'New' ? ui.conditionNew : ui.conditionUsed}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-black">
                      <MapPin size={18} className="text-blue-500" /> {translateLocation(car.location, lang)}
                    </span>
                  </div>
                  
                  <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter">
                    {car.make} <br/>
                    <span className="text-blue-600 dark:text-blue-500">{car.model}</span>
                  </h1>

                  <div className="flex items-center gap-4 text-slate-400 font-bold text-xl">
                     <span>{car.year}</span>
                     <div className="w-2 h-2 rounded-full bg-slate-300" />
                     <span>{car.engineSize}</span>
                  </div>
               </motion.div>
            </div>
          </div>

          {/* BOTTOM SECTION: الباقي التحت موزعة باحترافية */}
          <div className="space-y-16">
            
            {/* 3. Price Banner - خارج بطاقة الاسم وبشكل عريض */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="p-12 md:p-16 rounded-[4rem] bg-slate-50 dark:bg-blue-900/10 border-2 border-slate-100 dark:border-blue-500/20 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <DollarSign size={150} className="text-blue-500" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="text-center md:text-right">
                  <p className="text-sm font-black uppercase tracking-[0.4em] mb-3 text-blue-600 dark:text-blue-400">{ui.priceTitle}</p>
                  <div className="flex items-baseline justify-center md:justify-start gap-4">
                    <span className="text-8xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter">{(car.price / 1000000).toFixed(1)}</span>
                  <span className="text-4xl font-black" style={{ color: goldColor }}>{ui.currency}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-5 w-full md:w-auto">
                   <button 
                    onClick={() => setIsBookingModalOpen(true)}
                    className="px-16 py-7 bg-blue-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                   >
                      <CalendarCheck size={32} /> {ui.viewing}
                   </button>
                   <div className="flex gap-4">
                      <a href={`tel:${siteSettings?.contactPhone}`} className="flex-1 py-5 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center gap-3 font-black text-sm border border-slate-200 dark:border-white/10 hover:bg-slate-50 transition-all shadow-sm">
                         <Phone size={20} className="text-blue-500" /> {ui.call}
                      </a>
                      <a href={`https://wa.me/${siteSettings?.contactWhatsApp}`} className="flex-1 py-5 bg-[#25D366] text-white rounded-2xl flex items-center justify-center gap-3 font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20">
                         <MessageCircle size={20} /> {ui.whatsapp}
                      </a>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* 4. Specifications & Description */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               <div className="lg:col-span-8 space-y-12">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {specs.map((spec, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-white/5 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 hover:border-blue-500/30 transition-all group shadow-sm">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${accentColor}10`, color: accentColor }}>{spec.icon}</div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{spec.label}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{spec.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white dark:bg-white/5 p-12 rounded-[4rem] border border-slate-100 dark:border-white/5 space-y-8">
                    <h3 className="text-3xl font-black flex items-center gap-4">
                      <div className="w-2.5 h-10 bg-blue-600 rounded-full" /> 
                      <span style={{ color: 'inherit' }}>{ui.descTitle}</span>
                    </h3>
                    <p className="text-xl text-slate-600 dark:text-slate-400 leading-[1.8] font-medium">
                      {car.description || ui.defaultDesc}
                    </p>
                    
                    {/* زر الترجمة الذكية */}
                    {car.description && (
                      <button 
                        onClick={() => window.open(`https://translate.google.com/?sl=auto&tl=${lang}&text=${encodeURIComponent(car.description!)}&op=translate`, '_blank')}
                        className="mt-4 flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl transition-all"
                      >
                        <Languages size={14} />
                        {ui.translateBtn}
                      </button>
                    )}

                    {car.vin && (
                      <div className="inline-flex items-center gap-4 p-5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5">
                        <Hash size={20} className="text-blue-500" />
                        <span className="text-sm font-black text-slate-500 uppercase">{ui.vinLabel}:</span>
                        <code className="text-lg text-blue-600 font-black tracking-widest">{car.vin}</code>
                      </div>
                    )}
                  </div>
               </div>

               {/* Sidebar Bottom (Seller & Security) */}
               <div className="lg:col-span-4 space-y-8">
                  <div className="bg-slate-900 dark:bg-slate-800 p-10 rounded-[4rem] flex items-center gap-8 shadow-xl">
                    <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/30"><User size={48} /></div>
                    <div>
                      <h5 className="font-black text-white text-xl">{ui.seller}</h5>
                      <p className="text-base text-slate-500 font-bold italic">Team {siteSettings?.showroomName}</p>
                      <div className="flex items-center gap-1.5 mt-3">
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-amber-500 text-amber-500" />)}
                      </div>
                    </div>
                  </div>

                  <div className="p-10 rounded-[3.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-6">
                    <ShieldCheck size={32} className="text-emerald-500 shrink-0 mt-1" />
                    <p className="text-sm text-emerald-600 dark:text-emerald-500/80 font-bold leading-relaxed">{ui.security}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Similar Cars Preview - واضحة فالثيمين ودعم اللغات */}
        <div className="mt-40 space-y-12">
           <div className="flex items-end justify-between border-b border-slate-200 dark:border-white/10 pb-10">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">{ui.similar}</h2>
                <p className="text-slate-500 font-bold italic">{lang === 'ar' ? 'مختارات ذكية من فريقنا' : 'Smart recommendations'}</p>
              </div>
              <button className="flex items-center gap-3 text-blue-500 font-black text-base hover:translate-x-3 transition-transform">
                {ui.all} {lang === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 opacity-60 pointer-events-none">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-slate-50 dark:bg-white/5 rounded-[4rem] border border-slate-200 dark:border-white/10 border-dashed shadow-sm" />
              ))}
           </div>
        </div>
      </div>

      {/* Modal طلب معاينة - دعم كامل للغات الثلاث */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-10 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsBookingModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-[380px] max-h-[90vh] rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col relative border-t-[8px] border-[#D4AF37] animate-in zoom-in-95 duration-300"
            >
              {/* زر الإغلاق المطور - مصغر مع إظهار الحواف بشكل دائري أنيق للرجوع دائماً */}
              <button 
                onClick={() => setIsBookingModalOpen(false)}
                className="absolute top-5 left-5 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-rose-600 rounded-full transition-all group z-[210] border border-slate-200 dark:border-white/20 shadow-md"
              >
                <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* رأس الوثيقة - ممركز ليتماشى مع ستايل بطاقة تسجيل الدخول */}
              <div className="p-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 flex flex-col items-center shrink-0">
                <div className="space-y-1 text-center">
                  <h3 className="font-black text-lg text-blue-900 dark:text-blue-400 flex items-center justify-center gap-2">
                    <FileText className="text-[#D4AF37]" /> {ui.bookingTitle}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Official Reservation</p>
                </div>
              </div>

              <div className="p-8 space-y-5 relative z-10 overflow-y-auto custom-scrollbar flex-1">
                {/* علامة مائية خلفية (Watermark) */}
                <Car className="absolute bottom-10 left-5 text-slate-50 dark:text-white/5 w-32 h-32 -z-10 rotate-12 pointer-events-none" />

                <div className="space-y-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <label className="text-[10px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider">{ui.phoneLabel}</label>
                  <input 
                    type="tel" 
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 outline-none focus:border-[#D4AF37] transition-colors font-bold text-sm text-slate-700 dark:text-white"
                    placeholder="+213 ..."
                  />
                </div>
                <div className="space-y-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <label className="text-[10px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider">{ui.locationLabel}</label>
                  <input 
                    type="text" 
                    value={bookingForm.location}
                    onChange={(e) => setBookingForm({...bookingForm, location: e.target.value})}
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 outline-none focus:border-[#D4AF37] transition-colors font-bold text-sm text-slate-700 dark:text-white"
                  />
                </div>
                <div className="space-y-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <label className="text-[10px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider flex justify-between items-center mb-2">
                    <span>{ui.dateLabel}</span>
                    <span className="text-[8px] bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded text-blue-600">أيام العمل الرسمية</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableDates.map((date) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const isSelected = bookingForm.inspectionDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => setBookingForm({...bookingForm, inspectionDate: dateStr})}
                          className={`p-3 rounded-xl border-2 transition-all text-[10px] font-bold flex flex-col items-center gap-0.5 ${
                            isSelected 
                              ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-blue-900 dark:text-[#D4AF37] shadow-inner' 
                              : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 hover:border-blue-200'
                          }`}
                        >
                          <span className="font-black">{date.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long' })}</span>
                          <span className="opacity-60">{date.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}> {/* Time Slot Selection */}
                  <label className="text-[10px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider flex justify-between items-center mb-2">
                    <span>{ui.timeSlotLabel}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button type="button" onClick={() => setBookingForm(prev => ({ ...prev, inspectionTimeSlot: 'morning', inspectionHour: '' }))} className={`p-3 rounded-xl border-2 transition-all text-[10px] font-bold flex flex-col items-center gap-0.5 ${bookingForm.inspectionTimeSlot === 'morning' ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-blue-900 dark:text-[#D4AF37] shadow-inner' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 hover:border-blue-200'}`}>
                      <Sun size={16} /> {ui.morning}
                    </button>
                    <button type="button" onClick={() => setBookingForm(prev => ({ ...prev, inspectionTimeSlot: 'evening', inspectionHour: '' }))} className={`p-3 rounded-xl border-2 transition-all text-[10px] font-bold flex flex-col items-center gap-0.5 ${bookingForm.inspectionTimeSlot === 'evening' ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-blue-900 dark:text-[#D4AF37] shadow-inner' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 hover:border-blue-200'}`}>
                      <Moon size={16} /> {ui.evening}
                    </button>
                  </div>

                  {bookingForm.inspectionTimeSlot && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider flex justify-between items-center mb-2">
                        <span>{ui.hourLabel}</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(bookingForm.inspectionTimeSlot === 'morning' ? MORNING_HOURS : EVENING_HOURS).map(hour => (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => setBookingForm(prev => ({ ...prev, inspectionHour: hour }))}
                            className={`p-3 rounded-xl border-2 transition-all text-[10px] font-bold ${
                              bookingForm.inspectionHour === hour
                                ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-blue-900 dark:text-[#D4AF37] shadow-inner'
                                : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-500 hover:border-blue-200'
                            }`}
                          >
                            {hour}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <label className="text-[10px] font-black text-blue-900 dark:text-blue-400 uppercase tracking-wider">{ui.msgLabel}</label>
                  <textarea 
                    value={bookingForm.message}
                    onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 outline-none focus:border-[#D4AF37] transition-colors font-bold text-sm text-slate-700 dark:text-white h-20 resize-none"
                  />
                </div>
                
                <div className="pt-2">
                  <button 
                    onClick={handleFinalBooking}
                    className="w-full py-4 bg-blue-900 dark:bg-blue-600 text-white rounded-xl font-black shadow-xl hover:bg-blue-800 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-3 border-b-4 border-blue-950 active:border-b-0 active:translate-y-1"
                  >
                    <Send size={18} /> {ui.submit}
                  </button>
                </div>

                <p className="text-[9px] text-center text-slate-400 font-bold">
                  {ui.hint}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarDetailsContent;