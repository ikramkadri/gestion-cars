import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import AddCarForm, { CarFormData } from "./AddCarForm"; // Corrected path to same directory
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast"; // Corrected named import

export default function EditCarPage() {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // جلب بيانات السيارة
  const car = useQuery(api.cars.getCarById, { carId: carId as Id<"cars"> });
  const updateCar = useMutation(api.cars.updateCar);

  const handleSubmit = async (formData: CarFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("convex_token") || "";
      
      // إرسال التحديثات فقط (يمكن تنظيف الأوبجكت من الحقول غير القابلة للتعديل إذا لزم الأمر)
      await updateCar({
        token,
        carId: carId as Id<"cars">,
        updates: formData,
      });

      toast.success("تم تحديث بيانات السيارة بنجاح");
      navigate("/admin/inventory");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء التحديث";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (car === undefined) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (car === null) return <div className="p-10 text-center">السيارة غير موجودة.</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors">
        <ArrowRight size={20} />
        <span>العودة للمخزن</span>
      </button>
      <AddCarForm title={`تعديل: ${car.make} ${car.model}`} initialData={car} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}