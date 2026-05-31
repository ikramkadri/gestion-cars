import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'react-hot-toast';
import AddCarForm, { CarFormData } from '../components/AddCarForm';

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
    setIsLoading(true);
    try {
      // إرسال البيانات لدالة الـ Mutation المحصنة
      await addCar({
        token,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        price: formData.price,
        purchasePrice: formData.purchasePrice,
        mileage: formData.mileage,
        location: formData.location,
        fuel: formData.fuel,
        transmission: formData.transmission,
        drivetrain: formData.drivetrain,
        condition: formData.condition,
        images: formData.images || [],
        mainImage: formData.mainImage || undefined,
        vin: formData.vin, // الحقل القانوني المهم
        description: formData.description,
        color: formData.color,
        hasWarranty: formData.hasWarranty,
        cylinders: formData.cylinders,
        engineSize: formData.engineSize,
        origin: formData.origin,
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
    <AddCarForm 
      title="إضافة مركبة جديدة" 
      onSubmit={handleSubmit} 
      isLoading={isLoading} 
    />
  );
}