import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { toast } from 'react-hot-toast'; // Added missing import
import { 
  Car, MapPin, CheckCircle2, ChevronLeft, ChevronRight,
  Settings2, Palette, TrendingUp, TrendingDown,
  Zap, Info, Trash2, Camera, Plus, MousePointerClick, Pipette,
  Search, AlertCircle, Loader2,
} from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel'; // استيراد Id من Convex
import { api } from '../../convex/_generated/api';

// --- الثوابت ---
const CAR_MAKES = ['Toyota', 'Hyundai', 'Volkswagen', 'Renault', 'Peugeot', 'Dacia', 'Kia', 'Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Nissan', 'Chevrolet', 'Suzuki', 'Mitsubishi', 'Honda', 'Seat', 'Skoda', 'Fiat'];
const ORIGINS = ['خليجي', 'كوري', 'أوروبي', 'أمريكي', 'صيني', 'ياباني', 'محلي (الجزائر)'];
const ALGERIA_STATES = [
  '01 - أدرار', '02 - الشلف', '03 - الأغواط', '04 - أم البواقي', '05 - باتنة', '06 - بجاية', '07 - بسكرة', '08 - بشار', '09 - البليدة', '10 - البويرة',
  '11 - تمنراست', '12 - تبسة', '13 - تلمسان', '14 - تيارت', '15 - تيزي وزو', '16 - الجزائر', '17 - الجلفة', '18 - جيجل', '19 - سطيف', '20 - سعيدة',
  '21 - سكيكدة', '22 - سيدي بلعباس', '23 - عنابة', '24 - قالمة', '25 - قسنطينة', '26 - المدية', '27 - مستغانم', '28 - المسيلة', '29 - معسكر', '30 - ورقلة',
  '31 - وهران', '32 - البيض', '33 - إليزي', '34 - برج بوعريريج', '35 - بومرداس', '36 - الطارف', '37 - تندوف', '38 - تسمسيلت', '39 - الوادي', '40 - خنشلة',
  '41 - سوق أهراس', '42 - تيبازة', '43 - ميلة', '44 - عين الدفلى', '45 - النعامة', '46 - عين تموشنت', '47 - غرداية', '48 - غليزان', '49 - تيميمون', '50 - برج باجي مختار',
  '51 - أولاد جلال', '52 - بني عباس', '53 - عين صالح', '54 - عين قزام', '55 - تقرت', '56 - جانت', '57 - المغير', '58 - المنيعة'
];

const PRESET_COLORS = [
  { name: 'أبيض', hex: '#FFFFFF', text: 'text-gray-600' },
  { name: 'أسود', hex: '#000000', text: 'text-white' },
  { name: 'فضي', hex: '#C0C0C0', text: 'text-gray-800' },
  { name: 'رمادي', hex: '#808080', text: 'text-white' },
  { name: 'أحمر', hex: '#FF0000', text: 'text-white' },
  { name: 'أزرق', hex: '#0000FF', text: 'text-white' },
  { name: 'بني', hex: '#8B4513', text: 'text-white' },
  { name: 'ذهبي', hex: '#D4AF37', text: 'text-white' },
];

const CONDITIONS = [
  { id: 'Excellent', label: 'ممتازة', color: 'bg-green-500', icon: '✨' },
  { id: 'Good', label: 'جيدة جداً', color: 'bg-blue-500', icon: '👍' },
  { id: 'Fair', label: 'جيدة', color: 'bg-amber-500', icon: '👌' },
  { id: 'Poor', label: 'تحتاج إصلاح', color: 'bg-red-500', icon: '🔧' },
];

const FUEL_TYPES = ["Gasoline", "Diesel", "Electric", "Hybrid"];
const TRANSMISSIONS = ["Automatic", "Manual"];
const DRIVETRAINS = ["FWD", "RWD", "AWD", "4WD"];

// تعريف نوع حالة السيارة بناءً على Convex schema
type CarCondition = "New" | "Excellent" | "Good" | "Fair" | "Poor";

// تعريف الواجهة لضمان توافق المسارات والبيانات مع الصفحة الرئيسية
export interface CarFormData {
  make: string;
  model: string;
  origin?: string; // يمكن أن يكون اختياريًا
  year: number;
  description?: string; // يمكن أن يكون اختياريًا
  purchasePrice: number;
  price: number;
  mileage: number;
  location: string;
  color?: string; // يمكن أن يكون اختياريًا
  condition: CarCondition; // استخدام النوع المحدد
  fuel: "Gasoline" | "Diesel" | "Electric" | "Hybrid";
  transmission: "Automatic" | "Manual";
  drivetrain: "FWD" | "RWD" | "AWD" | "4WD";
  hasWarranty: boolean;
  cylinders?: number;
  engineSize?: string;
  mainImage?: Id<"_storage">; // استخدام Id من Convex
  images?: Id<"_storage">[]; // مصفوفة معرفات الصور
}

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
  icon?: React.ElementType | null; // يمكن أن يكون Icon أو null
}

// --- المكونات الفرعية ---
const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ label, value, onChange, suggestions, placeholder, icon: Icon }) => {
  const [show, setShow] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]); // تحديد النوع
  const wrapperRef = useRef<HTMLDivElement>(null); // تحديد نوع العنصر المرجعي

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { // تحديد نوع الحدث
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { // تحديد نوع الحدث
    const val = e.target.value;
    onChange(val);
    if (val.length > 0) {
      const matches = suggestions.filter((s: string) => s.toLowerCase().includes(val.toLowerCase())); // تحديد نوع s
      setFiltered(matches);
      setShow(true);
    } else {
      setShow(false);
    }
  };

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <label className="text-sm font-bold text-gray-600 mr-2 block text-right">{label}</label>
      <div className="relative">
        <input 
          value={value} 
          onChange={handleInputChange} 
          onFocus={() => { if(value.length === 0) { setFiltered(suggestions); setShow(true); } }}
          className="w-full p-4 pr-12 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none bg-white shadow-sm transition-all text-right" 
          placeholder={placeholder} 
        />
        {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />}
      </div>
      {show && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {filtered.map((opt, i) => (
            <button key={i} onClick={() => { onChange(opt); setShow(false); }} className="w-full text-right p-4 hover:bg-blue-50 text-gray-700 font-bold transition-colors border-b border-gray-50 last:border-0">
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// تعريف نوع الصورة للمعاينة والرفع
interface ImageItem {
  storageId: Id<"_storage">;
  url: string;
}

interface AddCarFormProps {
  onSubmit: (data: CarFormData) => void | Promise<void>;
  isLoading: boolean;
  title?: string;
  initialData?: CarFormData; // تحديد نوع initialData بشكل أكثر دقة
}

const AddCarForm = ({ onSubmit, isLoading, initialData, title }: AddCarFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<ImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.cars.generateUploadUrl);

  const [tempColor, setTempColor] = useState('#FFFFFF');
  const [isColorConfirmed, setIsColorConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    make: initialData?.make || '',
    model: initialData?.model || '',
    origin: initialData?.origin || '',
    year: initialData?.year || new Date().getFullYear(),
    description: initialData?.description || '',
    purchasePrice: initialData?.purchasePrice || 0,
    price: initialData?.price || 0,
    mileage: initialData?.mileage || 0,
    location: initialData?.location || '',
    color: initialData?.color || '#FFFFFF',
    condition: initialData?.condition || 'Excellent' as CarCondition, // تحديد النوع الافتراضي
    fuel: initialData?.fuel || 'Gasoline',
    transmission: initialData?.transmission || 'Automatic',
    drivetrain: initialData?.drivetrain || 'FWD',
    hasWarranty: initialData?.hasWarranty || false,
    cylinders: initialData?.cylinders || 4,
    engineSize: initialData?.engineSize || '',
  }); // استخدام initialData لتهيئة formData

  // تحميل الصور الموجودة واللون في حال التعديل
  useEffect(() => {
    const initial = initialData as any;
    if (initial?.mainImage && initial?.mainImageUrl) {
      const images: ImageItem[] = [{ storageId: initial.mainImage, url: initial.mainImageUrl }];
      if (initial.images && initial.imagesUrls) {
        initial.images.forEach((id: Id<"_storage">, index: number) => {
          if (id !== initial.mainImage && initial.imagesUrls[index]) {
            images.push({ storageId: id, url: initial.imagesUrls[index] });
          }
        });
      }
      setUploadedImages(images);
      if (initial.color) {
        setTempColor(initial.color);
        setIsColorConfirmed(true);
      }
    }
  }, [initialData]);

  // تحويل completedSteps إلى حالة مشتقة
  const completedSteps = React.useMemo(() => {
    const steps: number[] = [];
    if (formData.make && formData.model && formData.year) steps.push(1);
    if (isColorConfirmed && formData.condition) steps.push(2);
    if (formData.price > 0 && formData.location && formData.fuel && formData.transmission && formData.drivetrain) steps.push(3);
    if (uploadedImages.length > 0) steps.push(4);
    return steps;
  }, [formData, isColorConfirmed, uploadedImages.length]);


  const nextStep = () => {
    // التحقق من الخطوة الحالية قبل الانتقال
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.make) newErrors.make = "يرجى اختيار الماركة";
      if (!formData.model) newErrors.model = "يرجى كتابة الموديل";
      if (formData.year < 1900 || formData.year > 2026) newErrors.year = "سنة الصنع غير منطقية";
    } else if (currentStep === 2) {
      if (!isColorConfirmed) newErrors.color = "يجب تأكيد اللون المختار أولاً";
      if (!formData.fuel) newErrors.fuel = "يرجى اختيار نوع الوقود";
      if (!formData.transmission) newErrors.transmission = "يرجى اختيار ناقل الحركة";
      if (!formData.drivetrain) newErrors.drivetrain = "يرجى اختيار نظام الدفع";
    } else if (currentStep === 3) {
      if (formData.price <= 0) newErrors.price = "سعر البيع يجب أن يكون أكبر من 0";
      if (!formData.location) newErrors.location = "يرجى تحديد موقع السيارة";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const token = localStorage.getItem("convex_token") || "";

    try {
      for (const file of Array.from(files)) {
        // 1. الحصول على رابط الرفع
        const postUrl = await generateUploadUrl({ token });

        // 2. الرفع للسيرفر
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) throw new Error("Upload failed");
        const { storageId } = await result.json();

        // 3. تحديث مصفوفة الصور
        setUploadedImages(prev => [...prev, {
          storageId,
          url: URL.createObjectURL(file)
        }]);
      }
      toast.success("تم رفع الصور بنجاح");
    } catch (error) {
      console.error(error);
      toast.error("فشل في رفع الصور");
    } finally {
      setIsUploading(false);
    }
  };

  const profit = formData.price - formData.purchasePrice;
  const isLoss = profit < 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white min-h-screen rtl font-sans" dir="rtl">
      {/* Header */}
      <div className="mb-10 text-right flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black text-gray-900 mb-2">{title || 'إضافة سيارة للمخزون'}</h1>
           <p className="text-gray-500 font-medium">أكمل البيانات لإدراج السيارة في نظام الجرد الذكي</p>
        </div>
        <div className="hidden md:block">
            <div className="bg-slate-100 p-2 rounded-2xl flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                    <Settings2 size={20} />
                </div>
                <span className="text-xs font-black px-2">v2.5.0</span>
            </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 relative px-4">
        <div className="absolute top-7 left-0 w-full h-0.5 bg-gray-100 -z-10" />
        {['الأساسيات', 'المواصفات', 'المالية', 'الصور'].map((title, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border-4 ${
              currentStep === i + 1 ? 'bg-blue-600 border-blue-100 text-white shadow-xl scale-110' :
              completedSteps.includes(i + 1) ? 'bg-emerald-500 border-emerald-50 text-white' : 'bg-white border-gray-100 text-gray-300'
            }`}>
              {completedSteps.includes(i + 1) && currentStep !== i + 1 ? <CheckCircle2 size={24} /> : (i + 1)}
            </div>
            <span className={`text-[11px] font-bold ${currentStep === i + 1 ? 'text-blue-600' : 'text-gray-400'}`}>{title}</span>
          </div>
        ))}
      </div>

      {/* Main Form Area */}
      <div className="bg-gray-50/50 p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-inner min-h-[500px]">
        
        {/* Step 1: Basics */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-blue-600"><Car /> المعلومات الأساسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AutocompleteInput 
                label="الماركة" 
                value={formData.make} 
                onChange={(val) => setFormData({...formData, make: val})} 
                suggestions={CAR_MAKES} 
                placeholder="ابحث عن الماركة..." 
                icon={Search}
              />
              {errors.make && <p className="text-red-500 text-xs font-bold mt-1 mr-2">{errors.make}</p>}
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 mr-2 block text-right">الموديل</label>
                <input 
                  value={formData.model} 
                  onChange={(e) => setFormData({...formData, model: e.target.value})} 
                  className={`w-full p-4 rounded-2xl border-2 ${errors.model ? 'border-red-500' : 'border-transparent'} focus:border-blue-500 focus:bg-white outline-none bg-white shadow-sm transition-all text-right`} 
                  placeholder="مثال: Camry, Golf..." 
                />
                {errors.model && <p className="text-red-500 text-xs font-bold mt-1 mr-2">{errors.model}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 mr-2 block text-right">سنة الصنع</label>
                  <input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: Number(e.target.value)})} className="w-full p-4 rounded-2xl bg-white shadow-sm border-none text-center font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 mr-2 block text-right">كم مقطوع (KM)</label>
                  <input type="number" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: Number(e.target.value)})} className="w-full p-4 rounded-2xl bg-white shadow-sm border-none text-center font-bold" />
                </div>
              </div>
              <AutocompleteInput 
                label="المنشأ / الوارد" 
                value={formData.origin} 
                onChange={(val) => setFormData({...formData, origin: val})} 
                suggestions={ORIGINS} 
                placeholder="اختر المنشأ..." 
                icon={null} // تم إضافة icon: null لجعلها اختيارية
              /> 
            </div>
          </div>
        )}

        {/* Step 2: Specifications & Free Color Picker */}
        {currentStep === 2 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="text-md font-black text-gray-800 flex items-center gap-2 mb-6"><Info className="text-blue-500" /> حالة السيارة</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CONDITIONS.map((cond) => (
                  <button key={cond.id} onClick={() => setFormData({...formData, condition: cond.id as CarCondition})} className={`p-4 rounded-3xl flex flex-col items-center gap-3 transition-all border-4 ${formData.condition === cond.id ? 'border-blue-500 bg-white shadow-xl scale-105' : 'border-transparent bg-white/50 opacity-60'}`}>
                    <span className="text-3xl">{cond.icon}</span>
                    <span className="font-black text-xs text-gray-800">{cond.label}</span>
                    <div className={`w-full h-2 rounded-full ${cond.color}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
              <h3 className="text-lg font-black text-gray-800 border-b pb-4 flex items-center gap-2">
                <Settings2 className="text-indigo-500" size={20} /> المواصفات التقنية
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* نوع الوقود */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-500 mr-2 block text-right">نوع الوقود</label>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {FUEL_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setFormData({...formData, fuel: type as CarFormData['fuel']})}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${formData.fuel === type ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        {type === "Gasoline" ? "بنزين" : type === "Diesel" ? "ديزل" : type === "Electric" ? "كهرباء" : "هجين"}
                      </button>
                    ))}
                  </div>
                  {errors.fuel && <p className="text-red-500 text-xs font-bold mt-1 mr-2">{errors.fuel}</p>}
                </div>

                {/* ناقل الحركة */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-500 mr-2 block text-right">ناقل الحركة</label>
                  <div className="flex gap-2 justify-end">
                    {TRANSMISSIONS.map(type => (
                      <button
                        key={type}
                        onClick={() => setFormData({...formData, transmission: type as CarFormData['transmission']})}
                        className={`flex-1 px-4 py-2 rounded-xl text-xs font-black transition-all ${formData.transmission === type ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        {type === "Automatic" ? "أوتوماتيك" : "يدوي"}
                      </button>
                    ))}
                  </div>
                  {errors.transmission && <p className="text-red-500 text-xs font-bold mt-1 mr-2">{errors.transmission}</p>}
                </div>

                {/* نظام الدفع */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-500 mr-2 block text-right"> نظام الدفع</label>
                  <div className="flex gap-2 justify-end">
                    {DRIVETRAINS.map(type => (
                      <button
                        key={type}
                        onClick={() => setFormData({...formData, drivetrain: type as CarFormData['drivetrain']})}
                        className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${formData.drivetrain === type ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {errors.drivetrain && <p className="text-red-500 text-xs font-bold mt-1 mr-2">{errors.drivetrain}</p>}
                </div>

                {/* الضمان */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-500 mr-2 block text-right">الضمان</label>
                  <button
                    onClick={() => setFormData({...formData, hasWarranty: !formData.hasWarranty})}
                    className={`w-full px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${formData.hasWarranty ? 'bg-emerald-50 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                  >
                    <CheckCircle2 size={16} />
                    {formData.hasWarranty ? "متوفر" : "غير متوفر"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 mr-2 block text-right">حجم المحرك</label>
                  <input type="text" value={formData.engineSize || ''} onChange={(e) => setFormData({...formData, engineSize: e.target.value})} placeholder="مثال: 2.0L" className="w-full p-4 rounded-2xl bg-gray-50 border-none text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 mr-2 block text-right">الأسطوانات</label>
                  <input type="number" value={formData.cylinders || ''} onChange={(e) => setFormData({...formData, cylinders: Number(e.target.value)})} className="w-full p-4 rounded-2xl bg-gray-50 border-none text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                <label className="text-md font-black text-gray-800 flex items-center gap-2"><Palette className="text-pink-500" /> لون الهيكل</label>
                <div className="flex items-center gap-2 text-xs font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    <Pipette size={14} />
                    <span>اختر لوناً مخصصاً أو من القائمة</span>
                </div>
              </div>

              {/* القائمة السريعة */}
              <div className="flex flex-wrap gap-3 justify-center">
                {PRESET_COLORS.map(color => (
                  <button 
                    key={color.hex} 
                    onClick={() => { setTempColor(color.hex); setIsColorConfirmed(false); }} 
                    className={`w-12 h-12 rounded-2xl border-4 transition-all flex items-center justify-center ${tempColor.toUpperCase() === color.hex ? 'border-blue-500 scale-110 shadow-lg' : 'border-white'}`} 
                    style={{ backgroundColor: color.hex }}
                  >
                    {tempColor.toUpperCase() === color.hex && <CheckCircle2 className={color.text} size={20} />}
                  </button>
                ))}
              </div>

              {/* منتقي الألوان الحر والنتيجة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 border-t border-gray-50">
                <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 block">أداة اختيار اللون الحر:</label>
                    <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 group hover:border-blue-200 transition-all">
                        <div className="relative w-20 h-20 shrink-0">
                            <input 
                                type="color" 
                                value={tempColor} 
                                onChange={(e) => { setTempColor(e.target.value); setIsColorConfirmed(false); }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div 
                                className="w-full h-full rounded-2xl shadow-xl border-4 border-white transition-transform group-hover:scale-110" 
                                style={{ backgroundColor: tempColor }} 
                            />
                            <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-lg shadow-md">
                                <MousePointerClick size={14} className="text-blue-600" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="text-sm font-black text-gray-700">اضغط على المربع للاختيار</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{tempColor}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 block">اللون المعتمد حالياً:</label>
                    <div className="flex flex-col gap-4">
                       <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-[1.5rem] border-4 shadow-lg transition-all duration-500 ${isColorConfirmed ? 'border-emerald-500 scale-105' : 'border-white'}`} style={{ backgroundColor: tempColor }} />
                          <div className="flex-1">
                             <input 
                                 type="text" 
                                 value={tempColor.toUpperCase()} 
                                 onChange={(e) => { setTempColor(e.target.value); setIsColorConfirmed(false); }}
                                 className="w-full bg-transparent font-black text-2xl text-gray-800 outline-none"
                                 placeholder="#FFFFFF"
                             />
                          </div>
                       </div>
                       <button 
                        onClick={() => { setFormData({...formData, color: tempColor}); setIsColorConfirmed(true); }} 
                        className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 ${isColorConfirmed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-blue-600 text-white shadow-xl shadow-blue-100 hover:-translate-y-1'}`}
                       >
                        {isColorConfirmed ? <><CheckCircle2 size={20}/> تم الحفظ بنجاح</> : 'تأكيد هذا اللون'}
                       </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Finance */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <label className="text-xs font-black text-gray-400 mb-3 block">تكلفة الشراء الكلية</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={formData.purchasePrice || ''} onChange={(e) => setFormData({...formData, purchasePrice: Number(e.target.value)})} className="w-full text-3xl font-black outline-none bg-transparent focus:text-indigo-600 transition-colors" placeholder="0" />
                  <span className="font-black text-gray-300">دج</span>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-blue-100 focus-within:border-blue-500 transition-all">
                <label className="text-xs font-black text-blue-600 mb-3 block">سعر العرض للبيع</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={formData.price || ''} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full text-3xl font-black outline-none bg-transparent text-blue-700 focus:text-indigo-700 transition-colors" placeholder="0" />
                  <span className="font-black text-blue-200">دج</span>
                </div>
              </div>
            </div>

            {(formData.price > 0 && formData.purchasePrice > 0) && (
              <div className={`p-8 rounded-[3rem] border-4 transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative ${isLoss ? 'bg-red-50 border-red-200 text-red-900 shadow-xl shadow-red-100' : 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-xl shadow-emerald-100'}`}>
                <div className="flex items-center gap-5 relative z-10">
                  <div className={`p-5 rounded-2xl shadow-lg ${isLoss ? 'bg-red-600' : 'bg-emerald-600'} text-white animate-bounce`}>
                    {isLoss ? <TrendingDown size={32} /> : <TrendingUp size={32} />}
                  </div>
                  <div>
                    <h3 className="font-black text-2xl">{isLoss ? 'هناك خسارة!' : 'الربح الصافي متوفر'}</h3>
                    <p className="text-sm opacity-60 font-bold tracking-wider">تحليل مالي فوري</p>
                  </div>
                </div>
                <div className="text-center md:text-left relative z-10">
                   <div className="text-4xl font-black tabular-nums">
                     {Math.abs(profit).toLocaleString()} <small className="text-lg font-bold">دج</small>
                   </div>
                </div>
              </div>
            )}

            <AutocompleteInput 
              label="مقر تواجد السيارة" 
              value={formData.location} 
              onChange={(val) => setFormData({...formData, location: val})} 
              suggestions={ALGERIA_STATES} 
              placeholder="اختر الولاية..." 
              icon={MapPin}
            />
          </div>
        )}

        {/* Step 4: Images & Description */}
        {currentStep === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-amber-600"><Camera/> ألبوم الصور</h2>
                <span className="text-xs font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full">{uploadedImages.length} صور</span>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((img, i) => (
                <div key={img.storageId} className="aspect-square bg-white rounded-3xl relative flex items-center justify-center border-2 border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <img src={img.url} className="w-full h-full object-cover" alt="Car" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setUploadedImages(uploadedImages.filter((_, idx) => idx !== i))} className="p-3 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                        <Trash2 size={20}/>
                    </button>
                  </div>
                </div>
              ))}
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="aspect-square border-4 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all group disabled:opacity-50 active:scale-95"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    {isUploading ? <Loader2 className="animate-spin text-indigo-600" /> : <Plus size={24} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{isUploading ? 'جاري الرفع...' : 'إضافة صورة'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-600 mr-2 block text-right">ملاحظات البائع (الوصف)</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                rows={4} 
                className="w-full p-6 rounded-[2.5rem] bg-white shadow-inner outline-none border-2 border-transparent focus:border-blue-100 transition-all text-right resize-none" 
                placeholder="اذكر حالة المحرك، الدهان، أو أي إضافات أخرى..." 
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between px-4">
        <button 
          onClick={prevStep} 
          disabled={currentStep === 1} 
          className={`px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-2 ${currentStep === 1 ? 'invisible' : 'bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
        >
          <ChevronRight size={20} />
          السابق
        </button>

        {currentStep < 4 ? (
          <button 
            onClick={nextStep} 
            className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl shadow-gray-200 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-2"
          >
            التالي
            <ChevronLeft size={20} />
          </button>
        ) : (
          <button 
            disabled={completedSteps.length < 4} 
            className={`px-14 py-4 rounded-2xl font-black transition-all shadow-xl flex items-center gap-3 ${completedSteps.length === 4 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 hover:-translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              // دمج بيانات الصور المرفوعة مع بيانات النموذج قبل الإرسال
              const finalData = {
                ...formData,
                mainImage: uploadedImages[0]?.storageId, // أول صورة هي الرئيسية إجبارياً
                images: uploadedImages.map(img => img.storageId)
              };
              onSubmit(finalData as CarFormData);
            }}
          >
            <Zap size={20}/>
            حفظ ونشر الإعلان
          </button>
        )}
      </div>
      
      {/* Validation Message */}
      {currentStep === 4 && completedSteps.length < 4 && (
        <div className="mt-6 flex items-center gap-2 justify-center text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <AlertCircle size={18} />
            <span className="text-xs font-black">يرجى إكمال جميع الخطوات (تأكد من اختيار اللون وتأكيده وصورة واحدة على الأقل)</span>
        </div>
      )}
    </div>
  );
};

export default AddCarForm;