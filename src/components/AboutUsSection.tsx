import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const AboutUsSection = () => {
  const { t, language } = useLang();

  return (
    <section id="about-us" className="py-32 bg-white dark:bg-[#050505] relative overflow-hidden">
      <div className={`max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${language === 'ar' ? '' : 'lg:grid-flow-dense'}`}>
        <motion.div
          initial={{ opacity: 0, x: language === 'ar' ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          className={`space-y-8 ${language === 'ar' ? 'text-right' : 'text-left lg:col-start-2'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-inner">
            <Info size={14} /> {t('story_title')}
          </div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter">
            {t('story_desc')}
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed italic">
            {t('about_quote')}
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
              <h4 className="text-3xl font-black text-blue-600 mb-1">{t('stat_years')}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase">{t('stat_years_label')}</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
              <h4 className="text-3xl font-black text-amber-500 mb-1">{t('stat_guarantee')}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase">{t('stat_guarantee_label')}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className={`relative ${language === 'ar' ? '' : 'lg:col-start-1'}`}
        >
          <div className="aspect-[4/3] rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 transform -rotate-3 hover:rotate-0 transition-transform duration-700">
            <img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1500" className="w-full h-full object-cover" alt="Motorix Showroom" />
          </div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-20" />
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUsSection;