import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Star, Quote, Car, User } from "lucide-react";
import { useLang } from "../lib/LanguageContext";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
}

const TestimonialsSection = () => {
  const { lang } = useLang();
  const reviews = useQuery(api.reviews.getLatestReviews);

  const goldColor = '#D4AF37';

  const translations = {
    ar: { 
      title: "ثقة عملائنا", 
      subtitle: "ماذا يقول ممتلكو سيارات الأحلام عن تجربتهم مع موتوريكس",
      badge: "شهادات حقيقية"
    },
    fr: { 
      title: "Confiance de nos clients", 
      subtitle: "Ce que disent les propriétaires de voitures de rêve sur Motorix",
      badge: "Témoignages"
    },
    en: { 
      title: "Customer Trust", 
      subtitle: "What dream car owners say about their experience with Motorix",
      badge: "Testimonials"
    }
  };

  const t = translations[lang as 'ar' | 'fr' | 'en'] || translations.ar;

  if (reviews === undefined) return null;
  if (reviews.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-slate-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* تأثيرات الإضاءة الخلفية الفاخرة */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }} // تفعيل unobserve بمجرد الظهور
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <Quote size={12} fill="currentColor" /> {t.badge}
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            {t.title}
          </h2>
          <p className="text-slate-400 font-bold max-w-2xl mx-auto text-lg leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* السلايدر الأفقي (Horizontal Scroll) */}
        <div className="flex gap-8 overflow-x-auto pb-12 custom-scrollbar snap-x snap-mandatory px-4 scroll-smooth">
          {reviews.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true, amount: 0.3 }} // يتوقف عن المراقبة فور الرندرة (Performance Boost)
              className="min-w-[320px] md:min-w-[400px] snap-center"
            >
              <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] relative group hover:border-blue-500/30 transition-all duration-500 shadow-2xl will-change-[transform,opacity]">
                
                {/* أيقونة سيارة صغيرة للزينة */}
                <div className="absolute top-8 left-8 text-white/5 group-hover:text-blue-500/10 transition-colors duration-500">
                  <Car size={80} />
                </div>

                {/* التقييم بالنجوم */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, idx) => (
                    <Star 
                      key={idx} 
                      size={16} 
                      fill={idx < review.rating ? goldColor : "none"} 
                      className={idx < review.rating ? "text-[#D4AF37]" : "text-slate-600"} 
                    />
                  ))}
                </div>

                {/* نص التقييم */}
                <p className="text-slate-200 text-lg font-bold leading-relaxed mb-8 relative z-10 italic">
                  "{review.comment}"
                </p>

                {/* معلومات الزبون */}
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg">
                    <User size={24} /> 
                    {/* ملاحظة: إذا أضفت صورة زبون مستقبلاً، استخدم loading="lazy" */}
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm">{review.userName}</h4>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Car size={10} className="text-blue-500" /> Verified Buyer
                    </p>
                  </div>
                </div>

                {/* علامة الاقتباس الفاخرة */}
                <div className="absolute bottom-8 right-8 text-blue-500/20">
                  <Quote size={40} fill="currentColor" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* عبارة ختامية */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mt-10"
        >
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Join +500 Happy Owners in Algeria</p>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;