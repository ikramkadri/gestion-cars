import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import AddCarForm, { CarFormData } from "../components/AddCarForm";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/edit-car/ar.json';
import en from '../lib/i18n/pages/edit-car/en.json';
import fr from '../lib/i18n/pages/edit-car/fr.json';

export default function EditCarPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = usePageTranslation({ ar, en, fr });

  const car = useQuery(api.cars.getCarById, { carId: carId as Id<"cars"> });
  const updateCar = useMutation(api.cars.updateCar);

  const handleSubmit = async (formData: CarFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("convex_token") || "";

      await updateCar({
        token,
        carId: carId as Id<"cars">,
        updates: { ...formData, mainImage: formData.mainImage || undefined, images: formData.images || undefined },
      });

      toast.success(t('update_success'));
      navigate("/admin/inventory");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('update_error');
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

  if (car === null) return <div className="p-10 text-center">{t('car_not_found')}</div>;

  return (
    <AddCarForm
      title={t('page_title').replace('{make}', car.make).replace('{model}', car.model)}
      initialData={{
        ...car,
        mainImageUrl: car.mainImageUrl ?? null,
        mainImage: car.mainImage || undefined,
        images: car.images || [],
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
