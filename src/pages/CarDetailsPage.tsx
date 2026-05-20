import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { useMemo } from 'react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Loader2, ArrowRight } from 'lucide-react';
import { CarType } from '../features/cars/types/car.types';
import CarDetailsContent from '../components/CarDetailsContent';

const CarDetailsPage = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  
  // جلب البيانات - الباك إند يقوم الآن بجلب mainImageUrl و imageUrls تلقائياً
  const rawCar = useQuery(api.cars.getCarById, carId ? { carId: carId as Id<"cars"> } : "skip");
  const siteSettings = useQuery(api.site_settings.getSettings);
  
  const car = useMemo(() => {
    if (rawCar === null) return null;
    if (!rawCar) return undefined;

    // نمرر البيانات كما هي من الباك إند مع التأكد من تسمية مصفوفة الصور بشكل صحيح للـ Frontend
    if (rawCar) {
      return {
        ...rawCar,
        mainImageUrl: rawCar.mainImageUrl,
        imagesUrls: rawCar.imageUrls || [], // هنا تظهر بقية الصور
      } as CarType;
    }
    return undefined; 
  }, [rawCar]);

  if (car === undefined || siteSettings === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-black text-slate-900">السيارة غير موجودة</h2>
        <button onClick={() => navigate(-1)} className="text-blue-600 font-bold">العودة للخلف</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-blue-500/30 animate-in fade-in duration-700" dir="rtl">
      {/* تأثير خلفية ضوئي لتحسين المظهر */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Floating Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-[110] p-6 md:p-10 pointer-events-none">
        <div className="max-w-[1400px] mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="pointer-events-auto p-4 bg-white/5 backdrop-blur-3xl border border-white/10 text-white rounded-2xl hover:bg-blue-600 hover:border-blue-500 transition-all shadow-2xl group active:scale-95"
          >
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Immersive Detail Content */}
      <CarDetailsContent car={car} siteSettings={siteSettings} />
    </div>
  );
};

export default CarDetailsPage;