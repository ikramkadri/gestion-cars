import React from 'react';
import { X } from 'lucide-react';
import { CarType } from '../features/cars/types/car.types';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import CarDetailsContent from './CarDetailsContent';

interface CarDetailsModalProps {
  car: CarType;
  isOpen: boolean;
  onClose: () => void;
}

const CarDetailsModal = ({ car, isOpen, onClose }: CarDetailsModalProps) => {
  const siteSettings = useQuery(api.siteSettings.getSiteSettings);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-y-auto custom-scrollbar relative" dir="rtl">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 z-50 p-3 bg-white/10 backdrop-blur-md text-slate-900 dark:text-white rounded-full hover:bg-white/20 transition-all"
        >
          <X size={24} />
        </button>

        <CarDetailsContent car={car} siteSettings={siteSettings} />
      </div>
    </div>
  );
};

export default CarDetailsModal;