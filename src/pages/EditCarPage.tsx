import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import AddCarForm, { CarFormData } from "../components/AddCarForm";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditCarPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        updates: { ...formData, mainImage: formData.mainImage || undefined, images: formData.images || undefined }, // Pass undefined for null/empty optional fields
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
    <AddCarForm
      title={`تعديل: ${car.make} ${car.model}`}
      initialData={{
        ...car,
        mainImageUrl: car.mainImageUrl ?? null,
        mainImage: car.mainImage || undefined,
        images: car.images || [], // Ensure images is Id<"_storage">[]
        description: car.description ?? "",
        vin: car.vin ?? "",
        origin: car.origin ?? "",
        engineSize: car.engineSize ?? "",
        color: car.color ?? "",
      }}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
    />
  );
}