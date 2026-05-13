import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'fr' | 'en';
type Theme = 'light' | 'dark';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const translations = {
  ar: {
    searchPlaceholder: "ابحث عن الماركة، الموديل...",
    // sellCar: "بيع سيارتك", // تم إزالة هذا الخيار بناءً على طلبك
    home: "الرئيسية",
    buy: "شراء سيارة",
    auctions: "المزادات",
    news: "الأخبار",
    currency: "مليون",
    heroMessages: ["اعثر على سيارة أحلامك في الجزائر", "سوق السيارات الأول والوحيد", "بيع واشتري بضمان المحترفين"],
    login: "دخول",
    signup: "إنشاء حساب"
  },
  fr: {
    searchPlaceholder: "Chercher marque, modèle...",
    // sellCar: "Vendre", // Removed as per request
    home: "Accueil",
    buy: "Acheter",
    auctions: "Enchères",
    news: "Actualités",
    currency: "Millions",
    heroMessages: ["Trouvez votre voiture de rêve", "Le N°1 du marché en Algérie", "Achetez avec garantie"],
    login: "Connexion",
    signup: "S'inscrire"
  },
  en: {
    searchPlaceholder: "Search brand, model...",
    // sellCar: "Sell Car", // Removed as per request
    home: "Home",
    buy: "Buy",
    auctions: "Auctions",
    news: "News",
    currency: "Million",
    heroMessages: ["Find your dream car in Algeria", "The first and only car market", "Buy and sell with professionals"],
    login: "Login",
    signup: "Register"
  }
};

export type { Language, Theme, LanguageContextType };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');

  const isRtl = lang === 'ar';

  const t = (key: string) => {
    const langData = translations[lang] || translations['ar'];
    return (langData as any)[key] || key;
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    document.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.className = theme;
  }, [lang, theme, isRtl]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, theme, toggleTheme, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within LanguageProvider');
  return context;
};

export default LanguageProvider;