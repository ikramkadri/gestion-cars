import React from 'react';
import { Zap, Sun, Moon, User } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const Navbar = ({ onOpenAuth }: { onOpenAuth: () => void }) => {
  const { lang, setLang, theme, toggleTheme, t } = useLang();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      isScrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="text-white fill-white" size={24} />
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-black tracking-tighter transition-colors ${isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
                MOTOR<span className="text-blue-500">IX</span>
              </span>
            </div>
          </div>

          {/* Links */}
          <div className={`hidden lg:flex gap-6 text-[13px] font-black uppercase ${isScrolled ? 'text-slate-500 dark:text-slate-400' : 'text-white/80'}`}>
            <a href="#" className="hover:text-blue-500">{t('home')}</a>
            <a href="#" className="hover:text-blue-500">{t('buy')}</a>
            <a href="#" className="hover:text-blue-500">{t('news')}</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className={`${isScrolled ? 'text-slate-600 dark:text-slate-300' : 'text-white'}`}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Lang Toggle */}
          <div className="flex items-center gap-2 bg-black/10 p-1 rounded-lg">
            {['ar', 'fr', 'en'].map((l) => (
              <button 
                key={l}
                onClick={() => setLang(l as 'ar' | 'fr' | 'en')}
                className={`px-2 py-1 text-[10px] font-bold rounded ${lang === l ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <button onClick={onOpenAuth} className={`hidden md:flex items-center gap-2 font-bold text-sm ${isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
            <User size={18} />
            {t('login')}
          </button>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;