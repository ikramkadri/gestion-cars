import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'fr' | 'en';

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    dashboard: "لوحة التحكم",
    inventory: "المخزون",
    sales: "المبيعات",
    customers: "الزبائن",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    welcome_admin: "لوحة التحكم القيادية",
    welcome_sales: "أهلاً بك بطل المبيعات",
    total_sales: "إجمالي المبيعات",
    net_profit: "صافي الأرباح",
    stock: "المخزون",
    stock_value: "قيمة المخزون",
    latest_sales: "أحدث المبيعات",
    activity_feed: "سجل النشاطات",
    hero_title: "اعثر على سيارة أحلامك",
    search: "بحث",
    all_cars: "كل السيارات",
  },
  fr: {
    dashboard: "Tableau de bord",
    inventory: "Inventaire",
    sales: "Ventes",
    customers: "Clients",
    settings: "Paramètres",
    logout: "Déconnexion",
    welcome_admin: "Tableau de bord Direction",
    welcome_sales: "Bienvenue champion des ventes",
    total_sales: "Ventes totales",
    net_profit: "Bénéfice net",
    stock: "Stock disponible",
    stock_value: "Valeur du stock",
    latest_sales: "Dernières ventes",
    activity_feed: "Flux d'activité",
    hero_title: "Trouvez la voiture de vos rêves",
    search: "Rechercher",
    all_cars: "Toutes les voitures",
  },
  en: {
    dashboard: "Dashboard",
    inventory: "Inventory",
    sales: "Sales",
    customers: "Customers",
    settings: "Settings",
    logout: "Logout",
    welcome_admin: "Executive Dashboard",
    welcome_sales: "Welcome Sales Champion",
    total_sales: "Total Sales",
    net_profit: "Net Profit",
    stock: "Available Stock",
    stock_value: "Stock Value",
    latest_sales: "Latest Sales",
    activity_feed: "Activity Feed",
    hero_title: "Find your dream car",
    search: "Search",
    all_cars: "All Cars",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>((localStorage.getItem('app_lang') as Language) || 'ar');

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (key: string) => translations[lang][key] || key;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t, dir }}>
      <div dir={dir}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
