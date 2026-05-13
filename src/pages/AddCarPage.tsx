import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AddCarForm, { CarFormData } from './AddCarForm'; // Corrected path to match AddCarForm.tsx location

export default function AddCarPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("convex_token") || "";
  const addCar = useMutation(api.cars.addCar);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: CarFormData): Promise<void> => {
    if (!formData.mainImage) {
      toast.error("يرجى إضافة صورة واحدة على الأقل");
      return;
    }
    console.log("AddCarPage - Submitting formData:", formData); // Add this line for debugging
    setIsLoading(true);
    try {
      await addCar({
        token, // Pass token separately as it's not part of CarFormData
        ...formData, // Spread all fields from formData
      });

      toast.success("تمت إضافة السيارة بنجاح!");
      navigate("/admin/inventory");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الإضافة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowRight size={24} />
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">إضافة سيارة جديدة</h1>
        </div>
      </div>

      <AddCarForm 
        title="إضافة مركبة جديدة" 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
      />
    </div>
  );
}