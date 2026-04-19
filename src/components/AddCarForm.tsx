import React, { useState } from 'react';
import { 
  Car, 
  Camera, 
  Info, 
  Wrench, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Upload, 
  X,
  AlertCircle
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { id: 1, title: 'البيانات الأساسية', icon: <Info size={18} /> },
  { id: 2, title: 'المواصفات الفنية', icon: <Wrench size={18} /> },
  { id: 3, title: 'الصور والوسائط', icon: <Camera size={18} /> },
  { id: 4, title: 'التسعير والنشر', icon: <DollarSign size={18} /> },
];

interface AddCarFormProps {
  onCancel: () => void;
}

export default function AddCarForm({ onCancel }: AddCarFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    condition: 'new',
    mileage: '',
    engine: '',
    transmission: 'automatic',
    fuelType: 'gasoline',
    color: '',
    price: '',
    description: '',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-300">
      {/* Header & Steps Indicator - مستوحى من image_22121d.png */}
      <div className="bg-[#0f172a] p-8 text-center text-white relative">
        <h2 className="text-2xl font-bold mb-2">إضافة سيارة جديدة</h2>
        <p className="text-slate-400 text-sm mb-8">أدخل تفاصيل المركبة بدقة ليتم عرضها في صالة العرض فوراً</p>
        
        <div className="flex justify-between items-center max-w-2xl mx-auto relative px-4">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -translate-y-10 z-0" />
          
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                  currentStep >= step.id 
                  ? 'bg-indigo-600 text-white scale-110' 
                  : 'bg-slate-800 text-slate-500'
                }`}
              >
                {currentStep > step.id ? <Check size={20} /> : <span>{step.id}</span>}
              </div>
              <span className={`text-xs font-medium transition-colors ${
                currentStep >= step.id ? 'text-indigo-400' : 'text-slate-500'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8 min-h-[400px]">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">الماركة (Brand)</label>
              <input 
                type="text" 
                placeholder="مثلاً: Toyota" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.brand}
                onChange={(e) => updateFormData('brand', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">الموديل (Model)</label>
              <input 
                type="text" 
                placeholder="مثلاً: Camry" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.model}
                onChange={(e) => updateFormData('model', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">سنة الصنع</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.year}
                onChange={(e) => updateFormData('year', e.target.value)}
              >
                <option value="">اختر السنة</option>
                {[...Array(30)].map((_, i) => (
                  <option key={i} value={2025 - i}>{2025 - i}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">الحالة</label>
              <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                <button 
                  onClick={() => updateFormData('condition', 'new')}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${formData.condition === 'new' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500'}`}
                >جديد</button>
                <button 
                  onClick={() => updateFormData('condition', 'used')}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${formData.condition === 'used' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-slate-500'}`}
                >مستعمل</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Tech Specs */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">نوع المحرك</label>
              <input 
                type="text" 
                placeholder="مثلاً: V6 3.5L" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.engine}
                onChange={(e) => updateFormData('engine', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">ناقل الحركة</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.transmission}
                onChange={(e) => updateFormData('transmission', e.target.value)}
              >
                <option value="automatic">أوتوماتيك</option>
                <option value="manual">يدوي (عادي)</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">وصف إضافي للمواصفات</label>
              <textarea 
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                placeholder="تحدث عن أنظمة السلامة، الرفاهية، الخ..."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Images - مستوحى من Shopify UI */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in slide-in-from-left-4">
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all group cursor-pointer">
              <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">اسحب الصور هنا أو اضغط للرفع</h3>
              <p className="text-slate-500 text-sm mt-2">يمكنك رفع حتى 10 صور عالية الجودة (JPG, PNG)</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Placeholder for uploaded images */}
              <div className="aspect-video bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 text-xs">معاينة الصورة</div>
            </div>
          </div>
        )}

        {/* Step 4: Pricing */}
        {currentStep === 4 && (
          <div className="max-w-md mx-auto space-y-8 animate-in slide-in-from-left-4">
            <div className="space-y-4">
              <label className="text-lg font-bold text-slate-800 block text-center">حدد سعر البيع النهائي</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">DZD</span>
                <input 
                  type="number" 
                  className="w-full pl-16 pr-4 py-6 text-3xl font-bold text-indigo-600 bg-indigo-50 border-2 border-indigo-100 rounded-3xl focus:border-indigo-500 outline-none text-center"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => updateFormData('price', e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 border border-amber-100 text-amber-800 text-sm">
              <AlertCircle className="shrink-0" size={20} />
              <p>بمجرد الضغط على "نشر السيارة"، سيتم إدراجها في صالة العرض العامة وتنبيه العملاء المهتمين.</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
        <button 
          onClick={onCancel}
          className="text-slate-500 font-medium px-6 py-2 hover:text-slate-800 transition-colors"
        >
          إلغاء العملية
        </button>

        <div className="flex gap-3">
          {currentStep > 1 && (
            <button 
              onClick={prevStep}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold flex items-center gap-2 hover:bg-white transition-all"
            >
              <ChevronRight size={18} />
              السابق
            </button>
          )}
          
          {currentStep < 4 ? (
            <button 
              onClick={nextStep}
              className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              المتابعة
              <ChevronLeft size={18} />
            </button>
          ) : (
            <button 
              className="px-10 py-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
            >
              نشر السيارة الآن
              <Check size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}