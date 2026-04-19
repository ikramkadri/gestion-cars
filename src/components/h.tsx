import React, { useState } from 'react';
import { 
  Heart, 
  ChevronRight, 
  ChevronLeft, 
  Gauge, 
  Fuel, 
  Settings, 
  Eye, 
  ArrowUpRight,
  MapPin,
  Calendar,
  MessageCircle,
  Phone,
  CheckCircle2,
  Share2,
  ShieldAlert,
  Zap,
  Paintbrush
} from 'lucide-react';

const App = () => {
  const images = [
    "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1974", 
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1964"
  ];

  const [currentImg, setCurrentImg] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const nextImg = (e) => { e.stopPropagation(); setCurrentImg((prev) => (prev + 1) % images.length); };
  const prevImg = (e) => { e.stopPropagation(); setCurrentImg((prev) => (prev - 1 + images.length) % images.length); };

  const handleWhatsApp = () => {
    triggerToast("جاري فتح واتساب للمراسلة...");
    const message = encodeURIComponent("مرحباً، أود الاستفسار عن سيارة بورش 911 كاريرا.");
    setTimeout(() => window.open(`https://wa.me/213000000000?text=${message}`, '_blank'), 800);
  };

  const handleCall = () => {
    triggerToast("جاري بدء الاتصال الهاتفي...");
    setTimeout(() => window.location.href = "tel:+213000000000", 800);
  };

  const handleShare = () => {
    triggerToast("تم نسخ رابط الإعلان للمشاركة");
    const dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.value = window.location.href;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f1f5f9] p-4 md:p-6 font-sans" dir="rtl">
      
      {/* نظام الإشعارات */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
        <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">{toastMsg}</span>
        </div>
      </div>

      {/* البطاقة الرئيسية */}
      <div className="group relative flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] transition-all duration-700 border border-slate-200 h-auto md:min-h-[22rem]">
        
        {/* قسم معرض الصور - الحركة الأصلية (تداخل ناعم) */}
        <div className="relative w-full md:w-[24rem] h-64 md:h-full overflow-hidden shrink-0">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out 
                ${i === currentImg ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} 
                group-hover:scale-110`}
              alt="Luxury Car"
            />
          ))}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* أزرار التنقل */}
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
            <button onClick={prevImg} className="p-2.5 rounded-full bg-white/30 backdrop-blur-md border border-white/50 text-white hover:bg-white hover:text-black transition-all shadow-lg">
              <ChevronRight size={22} />
            </button>
            <button onClick={nextImg} className="p-2.5 rounded-full bg-white/30 backdrop-blur-md border border-white/50 text-white hover:bg-white hover:text-black transition-all shadow-lg">
              <ChevronLeft size={22} />
            </button>
          </div>

          <div className="absolute top-5 right-5 z-20">
            <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-emerald-600 text-[10px] font-black px-3.5 py-2 rounded-full shadow-xl border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              متاح حالياً
            </span>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentImg ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/40'}`} />
            ))}
          </div>
        </div>

        {/* قسم المحتوى */}
        <div className="flex-1 p-8 flex flex-col justify-between bg-white relative">
          
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm">جديد 2022</span>
                <span className="flex items-center gap-1 text-slate-500 text-[11px] font-bold">
                  <Eye size={13} className="text-slate-400" /> 2,410 مشاهدة
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 transition-all duration-500 group-hover:text-blue-600 group-hover:translate-x-1">
                Porsche 911 Carrera S
              </h3>
              <div className="flex items-center gap-4 text-slate-500 text-xs font-semibold">
                <span className="flex items-center gap-1.5"><MapPin size={15} className="text-blue-500" /> الجزائر العاصمة</span>
                <span className="flex items-center gap-1.5"><Calendar size={15} className="text-blue-500" /> وارد ألمانيا</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleShare} 
                className="p-3.5 rounded-2xl bg-slate-100 text-slate-600 hover:text-white hover:bg-blue-600 transition-all border border-slate-200 shadow-md hover:shadow-blue-200 active:scale-90"
                title="مشاركة"
              >
                <Share2 size={22} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => { setIsLiked(!isLiked); if(!isLiked) triggerToast("تمت الإضافة للمفضلة"); }}
                className={`p-3.5 rounded-2xl transition-all border-2 shadow-md active:scale-90 ${
                  isLiked 
                  ? 'bg-rose-50 text-rose-500 border-rose-200' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100'
                }`}
                title="إعجاب"
              >
                <Heart size={22} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* المواصفات الرئيسية مع حركات الأيقونات الناعمة الأصلية */}
          <div className="grid grid-cols-3 gap-6 py-6">
            {[
              { label: 'المسافة', value: '5k كم', icon: <Gauge size={18} />, delay: 'delay-0' },
              { label: 'المحرك', value: '3.0L T', icon: <Settings size={18} />, delay: 'delay-100' },
              { label: 'الوقود', value: 'بنزين', icon: <Fuel size={18} />, delay: 'delay-200' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2 cursor-default group/item">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 bg-slate-100 text-slate-600 rounded-2xl transition-all duration-500 
                    group-hover:bg-blue-600 group-hover:text-white group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-blue-200 ${item.delay}`}>
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-slate-400 font-black uppercase">{item.label}</span>
                    <span className="text-sm font-black text-slate-800">{item.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* مواصفات إضافية مخفية */}
          <div className={`overflow-hidden transition-all duration-700 ease-in-out ${showDetails ? 'max-h-24 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                   <Zap size={18} />
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-400 font-black">ناقل الحركة</p>
                   <p className="text-xs font-bold text-slate-700">أوتوماتيك PDK</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                    <Paintbrush size={18} />
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-400 font-black">حالة الطلاء</p>
                   <p className="text-xs font-bold text-slate-700">أصلي 100%</p>
                 </div>
               </div>
            </div>
          </div>

          {/* الجزء السفلي */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-5 border-t-2 border-slate-50">
            <div className="flex flex-col transition-all duration-500 group-hover:scale-110 origin-right">
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">السعر المطلوب</span>
               <div className="flex items-baseline gap-1.5">
                 <span className="text-4xl font-black text-slate-900 tracking-tight">2.4</span>
                 <span className="text-md font-bold text-blue-600">مليون دج</span>
               </div>
            </div>

            <div className="flex items-center gap-3 flex-1 sm:flex-initial">
              <button 
                onClick={handleWhatsApp}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#25D366] text-white px-7 py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-[#128C7E] hover:-translate-y-1.5 transition-all active:scale-95 group/wa"
              >
                <MessageCircle size={20} className="group-hover/wa:rotate-12 transition-transform" />
                <span>واتساب</span>
              </button>

              {/* زر الهاتف مع حركة Bounce عند تمرير الماوس */}
              <button 
                onClick={handleCall}
                className="p-4 bg-blue-50 text-blue-600 rounded-2xl border-2 border-blue-100 hover:bg-blue-600 hover:text-white hover:-translate-y-1.5 transition-all shadow-lg active:scale-95 hover:animate-bounce"
              >
                <Phone size={20} strokeWidth={2.5} />
              </button>

              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-900 text-white px-7 py-4 rounded-2xl font-black hover:bg-blue-600 hover:-translate-y-1.5 transition-all group/btn shadow-2xl shadow-slate-200"
              >
                {showDetails ? 'إخفاء' : 'التفاصيل'}
                <ArrowUpRight size={20} strokeWidth={2.5} className={`transition-transform duration-300 ${showDetails ? 'rotate-45' : 'group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* رسالة الأمان */}
      <div className="mt-8 flex items-center gap-3 text-slate-400 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 shadow-sm animate-pulse">
        <ShieldAlert size={18} className="text-amber-500" />
        <p className="text-xs font-bold italic">نصيحة أمان: تأكد دائماً من معاينة السيارة شخصياً قبل دفع أي مبالغ مالية.</p>
      </div>
    </div>
  );
};

export default App;