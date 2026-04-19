import React from 'react';
import { 
  Gauge, Fuel, MapPin, Trash2, Globe, TrendingDown, 
  CheckCircle2 
} from 'lucide-react';
import { Id } from "../../../convex/_generated/dataModel";

interface Car {
  _id: Id<"cars">;
  make: string;
  model: string;
  year: number;
  price: number;
  status: string;
  mileage: number;
  fuel: string;
  mainImage?: string;
  origin?: string;
  condition?: string;
}

interface CarCardProps {
  car: Car;
  onDelete: (id: Id<"cars">) => Promise<void>;
}

const CarCard = ({ car, onDelete }: CarCardProps) => {
  const formatPrice = (price: number) => new Intl.NumberFormat('ar-DZ').format(price);

  return (
    <div className="group relative w-full bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col h-full" dir="rtl">
      <div className="relative h-60 overflow-hidden bg-slate-100">
        <img 
          src={car.mainImage || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800"} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={car.model}
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <div className={`flex items-center gap-1.5 ${car.status === "Available" ? 'bg-emerald-500' : 'bg-rose-500'} text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg`}>
            {car.status === "Available" ? <TrendingDown size={14} /> : <CheckCircle2 size={14} />} 
            {car.status === "Available" ? "متاح" : "مباع"}
          </div>
          {car.origin && (
            <div className="bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg w-fit flex items-center gap-1">
              <Globe size={12} /> {car.origin}
            </div>
          )}
        </div>
        
        <div className="absolute top-4 left-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => onDelete(car._id)} 
            className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow text-right">
        <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight">
          {car.make} <span className="text-indigo-600">{car.model}</span>
        </h3>
        <div className="flex items-center gap-1.5 text-slate-400 mb-5 text-[11px] font-bold">
           <MapPin size={13} className="text-slate-300" />
           <span>{car.year}</span>
           <span className="mx-1 text-slate-200">•</span>
           <span>{car.condition === "Excellent" ? "حالة ممتازة" : "حالة جيدة"}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-slate-50 rounded-[1.8rem] border border-slate-100/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm border border-slate-100"><Gauge size={14} /></div>
            <span className="text-[10px] font-black text-slate-600">{car.mileage?.toLocaleString()} كلم</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm border border-slate-100"><Fuel size={14} /></div>
            <span className="text-[10px] font-black text-slate-600">
              {car.fuel === "Gasoline" ? "بنزين" : car.fuel === "Diesel" ? "ديزل" : "كهرباء"}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">السعر المعروض</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 leading-none">{formatPrice(car.price)}</span>
              <span className="text-[11px] font-black text-indigo-600">دج</span>
            </div>
          </div>
          <button className="bg-slate-900 hover:bg-indigo-600 text-white font-black px-5 py-3 rounded-2xl transition-all text-[11px] shadow-xl shadow-slate-200">
            تعديل
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;