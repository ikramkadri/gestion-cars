import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react'; // Keep useQuery
import { useMemo } from 'react'; // Import useMemo
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Loader2, ArrowRight } from 'lucide-react'; // Consolidated imports
import { CarType } from '../features/cars/types/car.types';
import CarDetailsContent from './CarDetailsContent';

const CarDetailsPage = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const rawCar = useQuery(api.cars.getCarById, carId ? { carId: carId as Id<"cars"> } : "skip");
  
  // تحديد ما إذا كانت الصورة الرئيسية هي رابط مباشر (URL) أم معرف تخزين (storageId)
  const isMainImageDirectUrl = rawCar?.mainImage && typeof rawCar.mainImage === 'string' && rawCar.mainImage.startsWith('/');

  // جلب رابط الصورة الفعلية من Convex Storage فقط إذا كانت storageId
  const fetchedMainImageUrl = useQuery(
    api.files.getImageUrl,
    rawCar?.mainImage && !isMainImageDirectUrl ? { storageId: rawCar.mainImage as Id<"_storage"> } : "skip"
  );

  // بناء كائن CarType الكامل مع روابط الصور
  const car = useMemo(() => {
    // حالة: السيارة غير موجودة في قاعدة البيانات
    if (rawCar === null) return null;

    let finalMainImageUrl: string | undefined;
    if (isMainImageDirectUrl) {
      finalMainImageUrl = rawCar.mainImage as string; // إذا كان رابط مباشر، استخدمه كما هو
    } else if (rawCar?.mainImage && fetchedMainImageUrl !== undefined) { // إذا كان storageId وتم جلب الرابط
      finalMainImageUrl = fetchedMainImageUrl === null ? undefined : fetchedMainImageUrl; // تحويل null إلى undefined
    } else if (rawCar?.mainImage === null) {
      finalMainImageUrl = undefined; // إذا كانت الصورة الرئيسية null
    } else {
      // لا يزال قيد التحميل أو rawCar.mainImage غير معرف
      finalMainImageUrl = undefined;
    }

    // إذا تم تحميل rawCar وتم حل رابط الصورة الرئيسية (أو لم تكن هناك حاجة له)
    if (rawCar && (finalMainImageUrl !== undefined || rawCar.mainImage === undefined || rawCar.mainImage === null)) {
      return {
        ...rawCar,
        mainImageUrl: finalMainImageUrl,
        images: [], 
        imagesUrls: [],
      } as CarType;
    }

    // حالة: لا يزال قيد التحميل
    return undefined; 
  }, [rawCar, fetchedMainImageUrl, isMainImageDirectUrl]);

  const siteSettings = useQuery(api.site_settings.getSettings);

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
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30" dir="rtl">
      {/* Floating Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-[100] p-6 md:p-10 pointer-events-none">
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