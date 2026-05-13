import React, { useState } from "react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ImagePlus, X, Loader2 } from "lucide-react";

export interface CarFormData {
  make: string;
  model: string;
  origin: string;
  year: number;
  price: number;
  purchasePrice: number;
  mileage: number;
  fuel: "Gasoline" | "Diesel" | "Electric" | "Hybrid";
  transmission: "Automatic" | "Manual";
  drivetrain: "FWD" | "RWD" | "AWD" | "4WD";
  condition: "New" | "Excellent" | "Good" | "Fair" | "Poor";
  engineSize: string;
  color: string;
  cylinders: number;
  location: string;
  description: string;
  hasWarranty: boolean;
  mainImage: Id<"_storage"> | null;
  images: Id<"_storage">[];
}

interface CarFormProps {
  initialData?: Partial<Doc<"cars">> & { mainImageUrl?: string; imagesUrls?: string[] };
  onSubmit: (data: CarFormData) => Promise<void>;
  isLoading: boolean;
  title: string;
}

const CarForm: React.FC<CarFormProps> = ({ initialData, onSubmit, isLoading, title }) => {
  const generateUploadUrl = useMutation(api.cars.generateUploadUrl);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<CarFormData>({
    make: initialData?.make || "",
    model: initialData?.model || "",
    origin: initialData?.origin || "",
    year: initialData?.year || new Date().getFullYear(),
    price: initialData?.price || 0,
    purchasePrice: initialData?.purchasePrice || 0,
    mileage: initialData?.mileage || 0,
    fuel: initialData?.fuel || "Gasoline",
    transmission: initialData?.transmission || "Automatic",
    drivetrain: initialData?.drivetrain || "FWD",
    condition: initialData?.condition || "Excellent",
    engineSize: initialData?.engineSize || "",
    color: initialData?.color || "",
    cylinders: initialData?.cylinders || 4,
    location: initialData?.location || "",
    description: initialData?.description || "",
    hasWarranty: initialData?.hasWarranty || false,
    mainImage: initialData?.mainImage || null,
    images: initialData?.images || [], // Convex Id<"_storage">[]
  });

  const [mainImagePreview, setMainImagePreview] = useState<string | null>(initialData?.mainImageUrl || null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initialData?.imagesUrls || []);

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", 0.7);
        };
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const token = localStorage.getItem("convex_token") || "";
      for (const file of Array.from(files)) {
        const compressedBlob = await compressImage(file);
        const postUrl = await generateUploadUrl({ token });
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: compressedBlob,
        });
        const { storageId } = await result.json();
        if (isMain) {
          setFormData(prev => ({ ...prev, mainImage: storageId }));
          setMainImagePreview(URL.createObjectURL(file));
          break;
        } else {
          setFormData(prev => ({ ...prev, images: [...prev.images, storageId] }));
          setGalleryPreviews(prev => [...prev, URL.createObjectURL(file)]);
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-right" dir="rtl">
      <h2 className="text-2xl font-black mb-6 text-slate-900">{title}</h2>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-4 border-b pb-6">
          <label className="block text-sm font-bold text-slate-700">صور السيارة</label>
          <div className="flex flex-wrap gap-4">
            <div className="relative w-32 h-32 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center overflow-hidden bg-slate-50">
              {mainImagePreview ? (
                <img src={mainImagePreview} alt="Main" className="w-full h-full object-cover" />
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                  <ImagePlus className="text-slate-400" />
                  <span className="text-[10px] text-slate-500 mt-1">الصورة الرئيسية</span>
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, true)} accept="image/*" />
                </label>
              )}
              {mainImagePreview && (
                <button type="button" onClick={() => {setMainImagePreview(null); setFormData(p=>({...p, mainImage: null}))}} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
              )}
            </div>
            {galleryPreviews.map((url, i) => (
              <div key={i} className="relative w-32 h-32 rounded-2xl overflow-hidden border">
                <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                <button type="button" onClick={() => {
                  setGalleryPreviews(prev => prev.filter((_, idx) => idx !== i));
                  setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
                }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
              </div>
            ))}
            <label className="w-32 h-32 border-2 border-dashed border-blue-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
              <ImagePlus className="text-blue-500" />
              <span className="text-[10px] text-blue-600 mt-1">إضافة صور</span>
              <input type="file" className="hidden" multiple onChange={(e) => handleFileUpload(e, false)} accept="image/*" />
            </label>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">الماركة (Make)</label>
            <input type="text" name="make" value={formData.make} onChange={handleChange} required className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">الموديل (Model)</label>
            <input type="text" name="model" value={formData.model} onChange={handleChange} required className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">السنة</label>
              <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">المسافة (KM)</label>
              <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">نوع الوقود</label>
              <select name="fuel" value={formData.fuel} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold">
                <option value="Gasoline">بنزين</option>
                <option value="Diesel">ديزل</option>
                <option value="Electric">كهرباء</option>
                <option value="Hybrid">هجين</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">ناقل الحركة</label>
              <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold">
                <option value="Automatic">أوتوماتيك</option>
                <option value="Manual">يدوي</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">اللون</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">المحرك</label>
              <input type="text" name="engineSize" value={formData.engineSize} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-center" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">الأسطوانات</label>
              <input type="number" name="cylinders" value={formData.cylinders} onChange={handleChange} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-center" />
            </div>
          </div>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-[2rem]">
          <div>
            <label className="block text-xs font-black text-blue-600 mb-2 mr-1 uppercase tracking-widest">سعر الشراء</label>
            <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="w-full p-4 rounded-2xl bg-white border border-blue-100 outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-800" />
          </div>
          <div>
            <label className="block text-xs font-black text-emerald-600 mb-2 mr-1 uppercase tracking-widest">سعر البيع</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-4 rounded-2xl bg-white border border-emerald-100 outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-800" />
          </div>
          <div className="flex items-center mt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.hasWarranty} onChange={(e) => setFormData(p => ({ ...p, hasWarranty: e.target.checked }))} className="w-5 h-5 rounded-lg text-blue-600 border-slate-300 focus:ring-blue-500" />
              <span className="text-sm font-bold text-slate-700">يتوفر على ضمان</span>
            </label>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-600 mb-2">وصف إضافي</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-right resize-none" placeholder="أدخل تفاصيل إضافية عن السيارة..."></textarea>
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={isLoading || isUploading} className="w-full py-5 rounded-2xl font-black text-white transition-all shadow-xl flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 shadow-blue-200 disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" /> : title}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CarForm;