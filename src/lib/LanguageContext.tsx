/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'fr' | 'en';
type Theme = 'light' | 'dark';

interface LanguageContextType {
  language: Language; // توحيد الاسم ليتوافق مع المكونات
  setLang: (l: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string, options?: Record<string, string | number>) => string;
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
  why_motorix_subtitle: string;
  feat_speed_title: string;
  feat_speed_desc: string;
  feat_trust_title: string;
  feat_trust_desc: string;
  feat_service_title: string;
  feat_service_desc: string;
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
  welcome_admin: string;
  welcome_sales: string;
  total_sales: string;
  nav_dashboard: string;
  nav_inventory: string;
  nav_browse_cars: string;
  nav_customers: string;
  nav_orders: string;
  nav_notifications: string;
  nav_settings: string;
  nav_add_car: string;
  nav_bookings: string;
  nav_sales: string;
  nav_invoices: string;
  nav_archive: string;
  nav_statistics: string;
  nav_users: string;
  nav_system_settings: string;
  nav_my_profile: string;
  sign_out: string;
  unverified_warning_title: string;
  unverified_warning_desc: string;
  notifications_title: string;
  notifications_empty: string;
  notifications_approve_btn: string;
  notifications_approve_loading: string;
  notifications_approve_success: string;
  notifications_approve_error: string;
  dashboard_subtitle_manager: string;
  dashboard_subtitle_admin: string;
  dashboard_net_profit: string;
  dashboard_available_stock: string;
  dashboard_unit_car: string;
  dashboard_stock_value: string;
  dashboard_quick_actions: string;
  dashboard_explore_inventory: string;
  dashboard_explore_inventory_desc: string;
  dashboard_activity_logs: string;
  dashboard_log_sale: string;
  dashboard_log_update: string;
  dashboard_no_activities: string;
  dashboard_no_activities_desc: string;
  dashboard_recent_sales: string;
  dashboard_view_all: string;
  dashboard_th_vehicle: string;
  dashboard_th_customer: string;
  dashboard_th_amount: string;
  dashboard_th_date: string;
  dashboard_th_seller: string;
  dashboard_th_status: string;
  dashboard_status_completed: string;
  dashboard_no_sales: string;
  dashboard_no_sales_desc: string;
  dashboard_theme_dark: string;
  dashboard_theme_light: string;
  chart_loading: string;
  chart_title: string;
  chart_subtitle: string;
  chart_revenue: string;
  inventory_title: string;
  inventory_subtitle: string;
  inventory_search_placeholder: string;
  inventory_filter_all: string;
  inventory_filter_new: string;
  inventory_filter_used: string;
  inventory_total_fleet: string;
  inventory_total_stock_value: string;
  inventory_pending: string;
  inventory_list_title: string;
  inventory_th_specifications: string;
  inventory_th_price: string;
  inventory_th_actions: string;
  inventory_spec_year: string;
  inventory_spec_not_specified: string;
  inventory_delete_confirm: string;
  inventory_delete_loading: string;
  inventory_delete_success: string;
  inventory_delete_error: string;
  inventory_status_restore_confirm: string;
  inventory_status_restore_loading: string;
  inventory_status_restore_success: string;
  inventory_status_restore_error: string;
  inventory_restore_btn_title: string;
  inventory_sell_btn_title: string;
  inventory_no_data: string;
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
    whyMotorix: "اكتشف تجربة {name} الفريدة",
    why_motorix_subtitle: "نقدم لك خدمات راقية تجعل من تجربة اقتناء سيارتك لحظة استثنائية",
    feat_speed_title: "سرعة الإنجاز",
    feat_speed_desc: "ننهي معاملاتك في أسرع وقت ونوفر لك سيارة أحلامك دون تأخير.",
    feat_trust_title: "ثقة وموثوقية",
    feat_trust_desc: "جميع السيارات تخضع لفحص تقني وقانوني شامل قبل العرض.",
    feat_service_title: "خدمة عملاء",
    feat_service_desc: "فريق متخصص لدعمك في كل خطوة من اختيار السيارة إلى ما بعد البيع.",
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
    welcome_admin: "مرحباً بك في لوحة التحكم",
    welcome_sales: "مرحباً بك",
    total_sales: "إجمالي المبيعات",
    legal_usage: "استخدامك للموقع يعني موافقتك على شروط المعاينة والشراء.",
    legal_privacy: "نحن نجمع بياناتك فقط لتسهيل عمليات الحجز.",
    legal_security: "يتم تشفير كافة المعلومات وحمايتها وفقاً لأعلى المعايير.",
    nav_dashboard: "الرئيسية",
    nav_inventory: "المخزون",
    nav_browse_cars: "تصفح السيارات",
    nav_customers: "الزبائن",
    nav_orders: "طلباتي ومشترياتي",
    nav_notifications: "التنبيهات",
    nav_settings: "إعدادات الحساب",
    nav_add_car: "إضافة سيارة",
    nav_bookings: "طلبات الحجز",
    nav_sales: "عملية بيع",
    nav_invoices: "الفواتير",
    nav_archive: "الأرشيف",
    nav_statistics: "التقارير المالية",
    nav_users: "إدارة الموظفين",
    nav_system_settings: "إعدادات النظام",
    nav_my_profile: "حسابي الشخصي",
    sign_out: "تسجيل الخروج",
    unverified_warning_title: "يرجى توثيق حسابك",
    unverified_warning_desc: "لتتمكن من إتمام عمليات الحجز.",
    notifications_title: "الإشعارات",
    notifications_empty: "لا توجد إشعارات جديدة.",
    notifications_approve_btn: "تفعيل الحساب الآن",
    notifications_approve_loading: "جاري تفعيل الحساب...",
    notifications_approve_success: "تم تفعيل المستخدم بنجاح 🎉",
    notifications_approve_error: "حدث خطأ أثناء التفعيل",
    dashboard_subtitle_manager: "إليك ملخص إنجازاتك الشخصية لهذا اليوم.",
    dashboard_subtitle_admin: "نظرة عامة على أسطول السيارات والنشاط التجاري.",
    dashboard_net_profit: "صافي الأرباح",
    dashboard_available_stock: "المخزون المتوفر",
    dashboard_unit_car: "سيارة",
    dashboard_stock_value: "قيمة المخزون",
    dashboard_quick_actions: "مركز القيادة السريع",
    dashboard_explore_inventory: "استكشف المخزون",
    dashboard_explore_inventory_desc: "يمكنك مشاهدة السيارات المتوفرة والبحث عن مواصفاتها من قسم المخزون.",
    dashboard_activity_logs: "سجل النشاطات",
    dashboard_log_sale: "أتم عملية بيع جديدة",
    dashboard_log_update: "قام بتحديث بيانات النظام",
    dashboard_no_activities: "لا توجد نشاطات بعد",
    dashboard_no_activities_desc: "سيظهر هنا سجل العمليات والنشاطات عند توفرها.",
    dashboard_recent_sales: "أحدث المبيعات",
    dashboard_view_all: "عرض الكل",
    dashboard_th_vehicle: "المركبة",
    dashboard_th_customer: "الزبون",
    dashboard_th_amount: "المبلغ",
    dashboard_th_date: "التاريخ",
    dashboard_th_seller: "البائع",
    dashboard_th_status: "الحالة",
    dashboard_status_completed: "مكتمل",
    dashboard_no_sales: "لا توجد مبيعات بعد",
    dashboard_no_sales_desc: "عند إتمام أول عملية بيع، ستظهر هنا في قائمة أحدث المبيعات.",
    dashboard_theme_dark: "الوضع الداكن",
    dashboard_theme_light: "الوضع المضيء",
    chart_loading: "جاري تحميل الرسم البياني...",
    chart_title: "أداء المبيعات",
    chart_subtitle: "إحصائيات الإيرادات لآخر 6 أشهر",
    chart_revenue: "الإيرادات",
    inventory_title: "إدارة المخزون",
    inventory_subtitle: "نظام تتبع الأسطول الذكي",
    inventory_search_placeholder: "ابحث بالماركة أو الموديل...",
    inventory_filter_all: "كل السيارات",
    inventory_filter_new: "جديد",
    inventory_filter_used: "مستعمل",
    inventory_total_fleet: "إجمالي الأسطول",
    inventory_total_stock_value: "قيمة المخزون الكلية",
    inventory_pending: "قيد الانتظار",
    inventory_list_title: "قائمة المركبات الحالية",
    inventory_th_specifications: "المواصفات",
    inventory_th_price: "السعر المعروض",
    inventory_th_actions: "الإجراءات",
    inventory_spec_year: "سنة الصنع: ",
    inventory_spec_not_specified: "غير محدد",
    inventory_delete_confirm: "هل أنت متأكد من حذف هذه السيارة؟",
    inventory_delete_loading: "جاري حذف السيارة وصورها...",
    inventory_delete_success: "تم حذف السيارة بنجاح",
    inventory_delete_error: "فشل حذف السيارة، يرجى المحاولة لاحقاً",
    inventory_status_restore_confirm: "هل تريد إعادة السيارة {name} للحالة \"متاحة للبيع\"؟",
    inventory_status_restore_loading: "جاري تحديث الحالة...",
    inventory_status_restore_success: "السيارة عادت للسوق بنجاح ✅",
    inventory_status_restore_error: "فشل التحديث",
    inventory_restore_btn_title: "إعادة السيارة متاحة للبيع",
    inventory_sell_btn_title: "إتمام عملية البيع",
    inventory_no_data: "لا توجد مركبات لعرضها حالياً..",
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
    whyMotorix: "Découvrez l'expérience unique {name}",
    why_motorix_subtitle: "Nous vous offrons des services haut de gamme pour faire de l'acquisition de votre voiture un moment exceptionnel",
    feat_speed_title: "Rapidité",
    feat_speed_desc: "Nous traitons vos transactions rapidement et vous livrons la voiture de vos rêves sans délai.",
    feat_trust_title: "Confiance",
    feat_trust_desc: "Tous les véhicules sont soumis à une inspection technique et légale complète.",
    feat_service_title: "Service client",
    feat_service_desc: "Une équipe dédiée vous accompagne à chaque étape, du choix à l'après-vente.",
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
    welcome_admin: "Bienvenue au tableau de bord",
    welcome_sales: "Bonjour",
    total_sales: "Total des ventes",
    finance_term_3: "Apport initial à partir de 20%.",
    legal_usage: "L'utilisation du site implique l'acceptation de nos conditions.",
    legal_privacy: "Vos données sont collectées uniquement pour faciliter la réservation.",
    legal_security: "Toutes les informations sont cryptées et protégées.",
    nav_dashboard: "Tableau de bord",
    nav_inventory: "Inventaire",
    nav_browse_cars: "Parcourir les voitures",
    nav_customers: "Clients",
    nav_orders: "Mes commandes",
    nav_notifications: "Notifications",
    nav_settings: "Paramètres du compte",
    nav_add_car: "Ajouter une voiture",
    nav_bookings: "Réservations",
    nav_sales: "Ventes",
    nav_invoices: "Factures",
    nav_archive: "Archives",
    nav_statistics: "Rapports financiers",
    nav_users: "Gestion du personnel",
    nav_system_settings: "Paramètres système",
    nav_my_profile: "Mon profil",
    sign_out: "Se déconnecter",
    unverified_warning_title: "Veuillez vérifier votre compte",
    unverified_warning_desc: "Pour pouvoir finaliser vos réservations.",
    notifications_title: "Notifications",
    notifications_empty: "Aucune nouvelle notification.",
    notifications_approve_btn: "Activer le compte maintenant",
    notifications_approve_loading: "Activation du compte en cours...",
    notifications_approve_success: "Utilisateur activé avec succès 🎉",
    notifications_approve_error: "Erreur lors de l'activation",
    dashboard_subtitle_manager: "Voici le résumé de vos réalisations personnelles pour aujourd'hui.",
    dashboard_subtitle_admin: "Aperçu de la flotte automobile et de l'activité commerciale.",
    dashboard_net_profit: "Bénéfice net",
    dashboard_available_stock: "Stock disponible",
    dashboard_unit_car: "voiture",
    dashboard_stock_value: "Valeur du stock",
    dashboard_quick_actions: "Commandes rapides",
    dashboard_explore_inventory: "Explorer l'inventaire",
    dashboard_explore_inventory_desc: "Vous pouvez voir les véhicules disponibles et rechercher leurs caractéristiques dans la section inventaire.",
    dashboard_activity_logs: "Journal d'activités",
    dashboard_log_sale: "A complété une nouvelle vente",
    dashboard_log_update: "A mis à jour les données du système",
    dashboard_no_activities: "Aucune activité pour le moment",
    dashboard_no_activities_desc: "L'historique des opérations s'affichera ici lorsqu'il sera disponible.",
    dashboard_recent_sales: "Ventes récentes",
    dashboard_view_all: "Voir tout",
    dashboard_th_vehicle: "Véhicule",
    dashboard_th_customer: "Client",
    dashboard_th_amount: "Montant",
    dashboard_th_date: "Date",
    dashboard_th_seller: "Vendeur",
    dashboard_th_status: "Statut",
    dashboard_status_completed: "Complété",
    dashboard_no_sales: "Aucune vente pour le moment",
    dashboard_no_sales_desc: "Lorsque la première vente sera effectuée, elle apparaîtra ici.",
    dashboard_theme_dark: "Mode sombre",
    dashboard_theme_light: "Mode clair",
    chart_loading: "Chargement du graphique...",
    chart_title: "Performance des ventes",
    chart_subtitle: "Statistiques des revenus des 6 derniers mois",
    chart_revenue: "Revenus",
    inventory_title: "Gestion des stocks",
    inventory_subtitle: "Système intelligent de suivi de flotte",
    inventory_search_placeholder: "Rechercher par marque ou modèle...",
    inventory_filter_all: "Toutes les voitures",
    inventory_filter_new: "Neuf",
    inventory_filter_used: "Occasion",
    inventory_total_fleet: "Flotte totale",
    inventory_total_stock_value: "Valeur totale du stock",
    inventory_pending: "En attente",
    inventory_list_title: "Liste des véhicules actuels",
    inventory_th_specifications: "Spécifications",
    inventory_th_price: "Prix proposé",
    inventory_th_actions: "Actions",
    inventory_spec_year: "Année : ",
    inventory_spec_not_specified: "Non spécifié",
    inventory_delete_confirm: "Êtes-vous sûr de vouloir supprimer cette voiture ?",
    inventory_delete_loading: "Suppression de la voiture et de ses images...",
    inventory_delete_success: "Voiture supprimée avec succès",
    inventory_delete_error: "Échec de la suppression, veuillez réessayer plus tard",
    inventory_status_restore_confirm: "Voulez-vous remettre le véhicule {name} au statut \"Disponible\" ?",
    inventory_status_restore_loading: "Mise à jour du statut en cours...",
    inventory_status_restore_success: "Véhicule remis sur le marché avec succès ✅",
    inventory_status_restore_error: "Échec de la mise à jour",
    inventory_restore_btn_title: "Remettre le véhicule en vente",
    inventory_sell_btn_title: "Finaliser la vente",
    inventory_no_data: "Aucun véhicule à afficher pour le moment..",
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
    whyMotorix: "Discover the unique {name} experience",
    why_motorix_subtitle: "We offer premium services that make acquiring your car an exceptional moment",
    feat_speed_title: "Speed",
    feat_speed_desc: "We handle your transactions quickly and deliver your dream car without delay.",
    feat_trust_title: "Trust",
    feat_trust_desc: "All vehicles undergo a full technical and legal inspection before listing.",
    feat_service_title: "Customer Service",
    feat_service_desc: "A dedicated team supports you every step of the way, from selection to after-sales.",
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
    welcome_admin: "Welcome to the Dashboard",
    welcome_sales: "Welcome",
    total_sales: "Total Sales",
    legal_usage: "Using the site implies acceptance of our terms.",
    legal_privacy: "Your data is collected only to facilitate bookings.",
    legal_security: "All information is encrypted and protected.",
    nav_dashboard: "Dashboard",
    nav_inventory: "Inventory",
    nav_browse_cars: "Browse Cars",
    nav_customers: "Customers",
    nav_orders: "My Orders & Purchases",
    nav_notifications: "Notifications",
    nav_settings: "Account Settings",
    nav_add_car: "Add Car",
    nav_bookings: "Bookings",
    nav_sales: "Sales",
    nav_invoices: "Invoices",
    nav_archive: "Archive",
    nav_statistics: "Financial Reports",
    nav_users: "Staff Management",
    nav_system_settings: "System Settings",
    nav_my_profile: "My Profile",
    sign_out: "Sign Out",
    unverified_warning_title: "Please verify your account",
    unverified_warning_desc: "In order to complete booking operations.",
    notifications_title: "Notifications",
    notifications_empty: "No new notifications.",
    notifications_approve_btn: "Activate Account Now",
    notifications_approve_loading: "Activating account...",
    notifications_approve_success: "User activated successfully 🎉",
    notifications_approve_error: "Error during activation",
    dashboard_subtitle_manager: "Here is a summary of your personal achievements for today.",
    dashboard_subtitle_admin: "Overview of the car fleet and business activity.",
    dashboard_net_profit: "Net Profit",
    dashboard_available_stock: "Available Stock",
    dashboard_unit_car: "car",
    dashboard_stock_value: "Stock Value",
    dashboard_quick_actions: "Quick Command Center",
    dashboard_explore_inventory: "Explore Inventory",
    dashboard_explore_inventory_desc: "You can view available vehicles and search for their specs in the inventory section.",
    dashboard_activity_logs: "Activity Logs",
    dashboard_log_sale: "Completed a new sale",
    dashboard_log_update: "Updated system data",
    dashboard_no_activities: "No activities yet",
    dashboard_no_activities_desc: "The history of operations and activities will appear here when available.",
    dashboard_recent_sales: "Recent Sales",
    dashboard_view_all: "View All",
    dashboard_th_vehicle: "Vehicle",
    dashboard_th_customer: "Customer",
    dashboard_th_amount: "Amount",
    dashboard_th_date: "Date",
    dashboard_th_seller: "Seller",
    dashboard_th_status: "Status",
    dashboard_status_completed: "Completed",
    dashboard_no_sales: "No sales yet",
    dashboard_no_sales_desc: "When the first sale is completed, it will appear here in the recent sales list.",
    dashboard_theme_dark: "Dark Mode",
    dashboard_theme_light: "Light Mode",
    chart_loading: "Loading chart...",
    chart_title: "Sales Performance",
    chart_subtitle: "Revenue statistics for the last 6 months",
    chart_revenue: "Revenue",
    inventory_title: "Inventory Management",
    inventory_subtitle: "Smart Fleet Tracking System",
    inventory_search_placeholder: "Search by brand or model...",
    inventory_filter_all: "All Cars",
    inventory_filter_new: "New",
    inventory_filter_used: "Used",
    inventory_total_fleet: "Total Fleet",
    inventory_total_stock_value: "Total Stock Value",
    inventory_pending: "Pending / Reserved",
    inventory_list_title: "Current Vehicles List",
    inventory_th_specifications: "Specifications",
    inventory_th_price: "Offered Price",
    inventory_th_actions: "Actions",
    inventory_spec_year: "Year: ",
    inventory_spec_not_specified: "Not Specified",
    inventory_delete_confirm: "Are you sure you want to delete this car?",
    inventory_delete_loading: "Deleting car and its photos...",
    inventory_delete_success: "Car deleted successfully",
    inventory_delete_error: "Failed to delete car, please try again later",
    inventory_status_restore_confirm: "Do you want to restore the car {name} to the \"Available\" status?",
    inventory_status_restore_loading: "Updating status...",
    inventory_status_restore_success: "Car restored to market successfully ✅",
    inventory_status_restore_error: "Failed to update",
    inventory_restore_btn_title: "Restore vehicle to available",
    inventory_sell_btn_title: "Complete sale process",
    inventory_no_data: "No vehicles to display at the moment..",
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
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'ar' || saved === 'fr' || saved === 'en') return saved;
    return 'ar';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // Respect system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  const isRtl = language === 'ar';

  const t = (key: string, options?: Record<string, string | number>) => {
    const langData = translations[language];
    const value = langData[key as keyof TranslationMessages];
    let result = typeof value === 'string' ? value : key;
    if (options) {
      Object.entries(options).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, String(v));
      });
    }
    return result;
  };

  const setLang = (l: Language) => {
    setLanguage(l);
    localStorage.setItem('app_language', l);
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('app_theme', next);
      return next;
    });
  };

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