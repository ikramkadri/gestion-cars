import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'react-hot-toast';
import AddCarForm, { CarFormData } from '../components/AddCarForm';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/add-car/ar.json';
import en from '../lib/i18n/pages/add-car/en.json';
import fr from '../lib/i18n/pages/add-car/fr.json';

export default function AddCarPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("convex_token") || "";
  const addCar = useMutation(api.cars.addCar);
  const { t } = usePageTranslation({ ar, en, fr });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: CarFormData): Promise<void> => {
    if (!formData.mainImage) {
      toast.error(t('image_required'));
      return;
    }
    setIsLoading(true);
    try {
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
        vin: formData.vin,
        description: formData.description,
        color: formData.color,
        hasWarranty: formData.hasWarranty,
        cylinders: formData.cylinders,
        engineSize: formData.engineSize,
        origin: formData.origin,
      });

      toast.success(t('add_success'));
      navigate("/admin/inventory");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('add_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AddCarForm 
      title={t('page_title')} 
      onSubmit={handleSubmit} 
      isLoading={isLoading} 
    />
  );
}
