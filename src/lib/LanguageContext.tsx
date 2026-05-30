/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'fr' | 'en';
type Theme = 'light' | 'dark';

interface LanguageContextType {
  language: Language; // توحيد الاسم ليتوافق مع المكونات
  setLang: (l: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string) => string;
  isRtl: boolean;
}

interface TranslationMessages {
  searchPlaceholder: string;
  home: string;
  helpMe: string;
  aboutUs: string;
  news: string;
  currency: string;
  heroMessages: string[];
  login: string;
  signup: string;
  luxuryFleet: string;
  latestAdditions: string;
  viewFullInventory: string;
  whyMotorix: string;
  securityAdvice: string;
  futureDriving: string;
  startNow: string;
  filter: string;
  search: string;
  allMakes: string;
  algeria: string;
  heroMsg1: string;
  heroMsg2: string;
  heroMsg3: string;
  orders_title: string;
  favorites_tab: string;
  my_bookings_tab: string;
  status_pending: string;
  status_confirmed: string;
  status_rejected: string;
  status_cancelled: string;
  all_cars: string;
  all_locations: string;
  explore: string;
  story_title: string;
  story_desc: string;
  footer_brand_desc: string;
  help_center: string;
  support_policies: string;
  how_to_book: string;
  finance_terms: string;
  motorix_guarantee: string;
  faq: string;
  privacy_policy: string;
  terms_of_use: string;
  after_sales: string;
  make_complaint: string;
  contact_us: string;
  leave_message_placeholder: string;
  message_sent_success: string;
  footer_badge: string;
  copyright_system: string;
  latest_additions_desc: string;
  luxury_fleet_desc: string;
  about_quote: string;
  stat_years: string;
  stat_years_label: string;
  stat_guarantee: string;
  stat_guarantee_label: string;
  bot_title: string;
  bot_subtitle: string;
  bot_placeholder: string;
  thinking: string;
  start_consultation: string;
  bot_fallback: string;
  bot_price_info: string;
  bot_booking_info: string;
  bot_greeting: string;
  bot_new_message: string;
  security_tip: string;
  algiers: string;
  oran: string;
  blida: string;
  setif: string;
  dzd: string;
  centimes: string;
  no_cars_found: string;
  how_to_book_title: string;
  booking_steps_intro: string;
  booking_step_1: string;
  booking_step_2: string;
  booking_step_3: string;
  booking_note: string;
  finance_terms_title: string;
  finance_intro: string;
  finance_term_1: string;
  finance_term_2: string;
  finance_term_3: string;
  legal_usage: string;
  legal_privacy: string;
  legal_security: string;
}

const translations: Record<Language, TranslationMessages> = {
  ar: {
    searchPlaceholder: "ابحث عن الماركة، الموديل...",
    // sellCar: "بيع سيارتك", // تم إزالة هذا الخيار بناءً على طلبك
    home: "الرئيسية",
    helpMe: "ساعدني في الاختيار",
    aboutUs: "من نحن",
    news: "الأخبار",
    currency: "مليون",
    heroMessages: ["اعثر على سيارة أحلامك في الجزائر", "سوق السيارات الأفضل والوحيد", "بيع واشتري بضمان المحترفين"],
    login: "دخول",
    signup: "إنشاء حساب",
    luxuryFleet: "تسوق من تشكيلتنا الفاخرة",
    latestAdditions: "أحدث الإضافات",
    viewFullInventory: "استكشف المخزون الكامل",
    whyMotorix: "اكتشف تجربة موتوريكس الفريدة",
    securityAdvice: "نصيحة أمان: عاين السيارة شخصياً قبل دفع أي مبالغ.",
    futureDriving: "مستقبل القيادة هنا",
    startNow: "ابدأ الآن",
    filter: "تصفية",
    search: "بحث",
    allMakes: "كل الماركات",
    algeria: "الجزائر",
    heroMsg1: "اعثر على سيارة أحلامك",
    heroMsg2: "معرض السيارات الأفضل في",
    heroMsg3: "احجز سيارتك المفضلة بكل أمان",
    orders_title: "طلباتي ومشترياتي",
    favorites_tab: "مفضلاتي ❤️",
    my_bookings_tab: "مشترياتي وحجوزاتي",
    status_pending: "قيد المراجعة",
    status_confirmed: "مقبول",
    status_rejected: "مرفوض",
    status_cancelled: "ملغي",
    all_cars: "كل السيارات",
    all_locations: "كل الولايات",
    explore: "استكشف",
    story_title: "القصة وراء MOTORIX",
    story_desc: "نعيد صياغة مفهوم اقتناء السيارات في الجزائر",
    footer_brand_desc: "المنصة الرائدة والوحيدة في الجزائر التي تجمع بين رفاهية العرض وضمان الفحص التقني والقانوني لكل مركبة.",
    help_center: "مركز المساعدة",
    support_policies: "الدعم والسياسات",
    how_to_book: "كيف أحجز سيارة؟",
    finance_terms: "شروط التمويل البنكي",
    motorix_guarantee: "ضمان موتوريكس",
    faq: "الأسئلة الشائعة",
    privacy_policy: "سياسة الخصوصية",
    terms_of_use: "شروط الاستخدام",
    after_sales: "خدمات ما بعد البيع",
    make_complaint: "تقديم شكوى",
    contact_us: "اتصل بنا",
    leave_message_placeholder: "اترك لنا رسالة أو تعليق...",
    message_sent_success: "تم إرسال رسالتك بنجاح، شكراً لتواصلك!",
    footer_badge: "شريكك الموثوق في الطريق",
    copyright_system: "نظام المعايير العالمية",
    latest_additions_desc: "نخبة مختارة من السيارات التي انضمت لأسطولنا حديثاً",
    luxury_fleet_desc: "تصفح مجموعة مختارة من أفضل السيارات المتوفرة حالياً",
    about_quote: "لم تكن بدايتنا مجرد معرض سيارات، بل كانت رؤية لتحويل عملية الشراء إلى تجربة رقمية موثوقة وفخمة تليق بتطلعات المواطن الجزائري.",
    stat_years: "+10 سنوات",
    stat_years_label: "من الخبرة في السوق",
    stat_guarantee: "100%",
    stat_guarantee_label: "ضمان الفحص القانوني",
    bot_title: "هل أنت حائر في الاختيار؟",
    bot_subtitle: "دع مساعد موتوريكس الذكي يساعدك!",
    bot_placeholder: "مثال: أحتاج سيارة عائلية اقتصادية بأقل من 300 مليون...",
    thinking: "جاري التفكير...",
    start_consultation: "ابدأ الاستشارة",
    bot_fallback: "أهلاً بك! أنا مساعد موتوريكس. لم أفهم طلبك تماماً، هل تريد الاستفسار عن سيارة معينة؟",
    bot_price_info: "لدينا سيارات تناسب جميع الميزانيات. استخدم شريط البحث في الأعلى لرؤية الأفضل لك.",
    bot_booking_info: "يمكنك حجز موعد معاينة لأي سيارة تعجبك بضغطة زر. الموعد مجاني تماماً.",
    bot_greeting: "وعليكم السلام! كيف يمكنني مساعدتك اليوم في العثور على سيارة أحلامك؟",
    bot_new_message: "رد جديد من المساعد الذكي ✨",
    security_tip: "نصيحة أمان: عاين السيارة شخصياً قبل دفع أي مبالغ.",
    algiers: "الجزائر العاصمة",
    oran: "وهران",
    blida: "البليدة",
    setif: "سطيف",
    dzd: "دج",
    centimes: "سنتيم",
    no_cars_found: "لم نجد سيارات تطابق بحثك حالياً.. جرب كلمات أخرى",
    how_to_book_title: "كيف أحجز سيارة؟",
    booking_steps_intro: "عملية الحجز في موتوريكس بسيطة جداً وتتم عبر 3 خطوات:",
    booking_step_1: "تصفح السيارات المتاحة واختيار المركبة المناسبة.",
    booking_step_2: "الضغط على زر 'احجز موعد معاينة' وتحديد الموعد.",
    booking_step_3: "سيقوم مستشار المبيعات بالاتصال بك لتأكيد الموعد.",
    booking_note: "ملاحظة: الحجز لا يعتبر بيعاً نهائياً، بل هو أولوية لك للمعاينة.",
    finance_terms_title: "شروط التمويل البنكي",
    finance_intro: "نتعامل مع كبرى البنوك في الجزائر لتسهيل عملية الشراء:",
    finance_term_1: "يجب أن لا يتعدى الاقتطاع الشهري 30% من دخلك الصافي.",
    finance_term_2: "توفير كشف راتب لآخر 3 أشهر.",
    finance_term_3: "دفعة أولى تبدأ من 20% من قيمة السيارة.",
    legal_usage: "استخدامك للموقع يعني موافقتك على شروط المعاينة والشراء.",
    legal_privacy: "نحن نجمع بياناتك فقط لتسهيل عمليات الحجز.",
    legal_security: "يتم تشفير كافة المعلومات وحمايتها وفقاً لأعلى المعايير.",
  },
  fr: {
    searchPlaceholder: "Chercher marque, modèle...",
    // sellCar: "Vendre", // Removed as per request
    home: "Accueil",
    helpMe: "Aide au choix",
    aboutUs: "À propos",
    news: "Actualités",
    currency: "Millions",
    heroMessages: ["Trouvez votre voiture de rêve", "Le meilleur du marché en Algérie", "Achetez avec garantie"],
    login: "Connexion",
    signup: "S'inscrire",
    luxuryFleet: "Découvrez notre flotte de luxe",
    latestAdditions: "Derniers ajouts",
    viewFullInventory: "Voir tout l'inventaire",
    whyMotorix: "Découvrez l'expérience unique Motorix",
    securityAdvice: "Conseil de sécurité : Inspectez le véhicule en personne avant tout paiement.",
    futureDriving: "L'avenir de la conduite est ici",
    startNow: "Commencer",
    filter: "Filtrer",
    search: "Chercher",
    allMakes: "Toutes les marques",
    algeria: "Algérie",
    heroMsg1: "Trouvez la voiture de vos rêves",
    heroMsg2: "Le meilleur showroom en",
    heroMsg3: "Réservez votre voiture en toute sécurité",
    orders_title: "Mes Commandes",
    favorites_tab: "Favoris ❤️",
    my_bookings_tab: "Mes Réservations",
    status_pending: "En attente",
    status_confirmed: "Confirmé",
    status_rejected: "Refusé",
    status_cancelled: "Annulé",
    all_cars: "Toutes les voitures",
    all_locations: "Toutes les wilayas",
    explore: "Explorer",
    story_title: "L'histoire de MOTORIX",
    story_desc: "Redéfinir l'acquisition automobile en Algérie",
    footer_brand_desc: "La plateforme leader et unique en Algérie alliant luxe et garantie d'inspection technique et légale.",
    help_center: "Centre d'Aide",
    support_policies: "Support et Politiques",
    how_to_book: "Comment réserver ?",
    finance_terms: "Conditions de financement",
    motorix_guarantee: "Garantie Motorix",
    faq: "Foire aux questions",
    privacy_policy: "Politique de confidentialité",
    terms_of_use: "Conditions d'utilisation",
    after_sales: "Service après-vente",
    make_complaint: "Déposer une plainte",
    contact_us: "Contactez-nous",
    leave_message_placeholder: "Laissez-nous un message...",
    message_sent_success: "Votre message a été envoyé avec succès !",
    footer_badge: "Votre partenaire de confiance",
    copyright_system: "GLOBAL STANDARD SYSTEM",
    latest_additions_desc: "Une sélection de véhicules récemment ajoutés à notre flotte",
    luxury_fleet_desc: "Parcourez une sélection des meilleurs véhicules disponibles",
    about_quote: "Notre début n'était pas seulement un showroom, mais une vision pour transformer l'achat en une expérience numérique faste.",
    stat_years: "+10 Ans",
    stat_years_label: "d'expérience sur le marché",
    stat_guarantee: "100%",
    stat_guarantee_label: "Garantie d'inspection légale",
    bot_title: "Besoin d'aide pour choisir ?",
    bot_subtitle: "Laissez l'assistant intelligent Motorix vous guider !",
    bot_placeholder: "Ex: Je cherche une voiture familiale à moins de 300 millions...",
    thinking: "Réflexion en cours...",
    start_consultation: "Démarrer",
    bot_fallback: "Bienvenue ! Je suis l'assistant Motorix. Comment puis-je vous aider ?",
    bot_price_info: "Nous avons des voitures pour tous les budgets. Utilisez les filtres pour voir les options.",
    bot_booking_info: "Vous pouvez réserver un rendez-vous gratuitement en un clic.",
    bot_greeting: "Bonjour ! Comment puis-je vous aider à trouver votre voiture de rêve ?",
    bot_new_message: "Nouveau message de l'assistant ✨",
    security_tip: "Conseil : Inspectez le véhicule en personne avant tout paiement.",
    algiers: "Alger",
    oran: "Oran",
    blida: "Blida",
    setif: "Sétif",
    dzd: "DZD",
    centimes: "Centimes",
    no_cars_found: "Aucun véhicule trouvé.. Essayez d'autres mots clés",
    how_to_book_title: "Comment réserver une voiture ?",
    booking_steps_intro: "Le processus de réservation est simple :",
    booking_step_1: "Choisissez le véhicule qui vous convient.",
    booking_step_2: "Cliquez sur 'Réserver' et choisissez une date.",
    booking_step_3: "Un conseiller vous contactera pour confirmer.",
    booking_note: "Note : La réservation n'est pas une vente finale, c'est une priorité d'inspection.",
    finance_terms_title: "Conditions bancaires",
    finance_intro: "Nous travaillons avec les grandes banques en Algérie :",
    finance_term_1: "La mensualité ne doit pas dépasser 30% de votre revenu net.",
    finance_term_2: "Fournir les 3 dernières fiches de paie.",
    finance_term_3: "Apport initial à partir de 20%.",
    legal_usage: "L'utilisation du site implique l'acceptation de nos conditions.",
    legal_privacy: "Vos données sont collectées uniquement pour faciliter la réservation.",
    legal_security: "Toutes les informations sont cryptées et protégées.",
  },
  en: {
    searchPlaceholder: "Search brand, model...",
    // sellCar: "Sell Car", // Removed as per request
    home: "Home",
    helpMe: "Help Me Choose",
    aboutUs: "About Us",
    news: "News",
    currency: "Million",
    heroMessages: ["Find your dream car in Algeria", "The best and only car market", "Buy and sell with professionals"],
    login: "Login",
    signup: "Register",
    luxuryFleet: "Shop our luxury collection",
    latestAdditions: "Latest additions",
    viewFullInventory: "Explore full inventory",
    whyMotorix: "Discover the unique Motorix experience",
    securityAdvice: "Safety tip: Inspect the car in person before making any payments.",
    futureDriving: "The future of driving is here",
    startNow: "Start Now",
    filter: "Filter",
    search: "Search",
    allMakes: "All Makes",
    algeria: "Algeria",
    heroMsg1: "Find your dream car",
    heroMsg2: "The best showroom in",
    heroMsg3: "Book your favorite car safely",
    orders_title: "My Orders",
    favorites_tab: "Favorites ❤️",
    my_bookings_tab: "My Bookings",
    status_pending: "Pending",
    status_confirmed: "Confirmed",
    status_rejected: "Rejected",
    status_cancelled: "Cancelled",
    all_cars: "All Cars",
    all_locations: "All Locations",
    explore: "Explore",
    story_title: "The Story Behind MOTORIX",
    story_desc: "Redefining car acquisition in Algeria",
    footer_brand_desc: "The leading and unique platform in Algeria combining luxury display and guaranteed technical and legal inspection.",
    help_center: "Help Center",
    support_policies: "Support & Policies",
    how_to_book: "How to book?",
    finance_terms: "Finance terms",
    motorix_guarantee: "Motorix Guarantee",
    faq: "FAQ",
    privacy_policy: "Privacy Policy",
    terms_of_use: "Terms of Use",
    after_sales: "After-sales services",
    make_complaint: "Make a complaint",
    contact_us: "Contact Us",
    leave_message_placeholder: "Leave us a message...",
    message_sent_success: "Your message has been sent successfully!",
    footer_badge: "Your trusted partner on the road",
    copyright_system: "GLOBAL STANDARD SYSTEM",
    latest_additions_desc: "A handpicked selection of vehicles recently added to our fleet",
    luxury_fleet_desc: "Browse a selection of the best vehicles currently available",
    about_quote: "Our beginning was more than just a showroom, it was a vision to transform car buying into a premium digital experience.",
    stat_years: "+10 Years",
    stat_years_label: "of market experience",
    stat_guarantee: "100%",
    stat_guarantee_label: "Legal inspection guarantee",
    bot_title: "Confused about which one to choose?",
    bot_subtitle: "Let the Motorix AI assistant help you!",
    bot_placeholder: "Ex: I need a family car for less than 3M DZD...",
    thinking: "Thinking...",
    start_consultation: "Start Now",
    bot_fallback: "Welcome! I am the Motorix assistant. How can I help you today?",
    bot_price_info: "We have cars for every budget. Use the filters to find yours.",
    bot_booking_info: "You can book an inspection appointment for free with one click.",
    bot_greeting: "Hello! How can I help you find your dream car today?",
    bot_new_message: "New message from AI assistant ✨",
    security_tip: "Safety tip: Inspect the vehicle in person before making any payments.",
    algiers: "Algiers",
    oran: "Oran",
    blida: "Blida",
    setif: "Setif",
    dzd: "DZD",
    centimes: "Centimes",
    no_cars_found: "No vehicles matching your search found..",
    how_to_book_title: "How to book a car?",
    booking_steps_intro: "The booking process is simple:",
    booking_step_1: "Choose the vehicle you like.",
    booking_step_2: "Click 'Book Appointment' and set the date.",
    booking_step_3: "A sales consultant will call you to confirm.",
    booking_note: "Note: Booking is not a final sale, it's a priority for inspection.",
    finance_terms_title: "Banking Terms",
    finance_intro: "We work with major banks in Algeria:",
    finance_term_1: "Monthly payment should not exceed 30% of your net income.",
    finance_term_2: "Provide the last 3 pay slips.",
    finance_term_3: "Initial payment starting from 20%.",
    legal_usage: "Using the site implies acceptance of our terms.",
    legal_privacy: "Your data is collected only to facilitate bookings.",
    legal_security: "All information is encrypted and protected.",
  }
};

export type { Language, Theme, LanguageContextType };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * هوك مخصص لاستخدام سياق اللغة في أي مكون
 */
export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguage = useLang;

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');

  const isRtl = language === 'ar';

  const t = (key: string) => {
    const langData = translations[language];
    const value = langData[key as keyof TranslationMessages];
    return typeof value === 'string' ? value : key;
  };

  const setLang = (l: Language) => setLanguage(l);
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    document.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.className = theme;
  }, [language, theme, isRtl]);

  return (
    <LanguageContext.Provider value={{ language, setLang, theme, toggleTheme, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;