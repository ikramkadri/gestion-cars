import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Plus, Loader2, Search, Briefcase, DollarSign, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import CarCard from '../components/CarCard';
import AddCarForm from '../components/AddCarForm';

export default function AdminDashboard() {
  const [view, setView] = useState<'inventory' | 'add'>('inventory');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Convex Hooks
  const cars = useQuery(api.cars.getCars, { includeArchived: false });
  const stats = useQuery(api.statistics.getDashboardStats);
  const addCarMutation = useMutation(api.cars.addCar);
  const archiveCarMutation = useMutation(api.cars.archiveCar);
  const generateUploadUrl = useMutation(api.cars.generateUploadUrl);

  const [formData, setFormData] = useState({
    make: "Mercedes", model: "", origin: "Germany", year: 2024,
    price: 0, purchasePrice: 0, mileage: 0, fuel: "Gasoline",
    transmission: "Automatic", drivetrain: "AWD", condition: "Excellent",
    description: "", mainImage: "", images: []
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, { method: "POST", body: file });
      const { storageId } = await result.json();
      setPreviewImage(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, mainImage: storageId, images: [storageId] }));
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  const handleDeleteCar = async (carId: Id<"cars">) => {
    if (window.confirm("هل أنت متأكد من أرشفة هذه السيارة؟")) {
      await archiveCarMutation({ carId });
    }
  };

  const handleAddCar = async () => {
    if (!formData.mainImage) return alert("يرجى رفع صورة أولاً");
    setIsSubmitting(true);
    try {
      await addCarMutation({ ...formData });
      setView('inventory');
      setStep(1);
      setPreviewImage(null);
    } catch (err) { alert(err instanceof Error ? err.message : "خطأ"); } finally { setIsSubmitting(false); }
  };

  const filteredCars = useMemo(() => {
    if (!cars) return [];
    return cars.filter((c: any) => c.make.toLowerCase().includes(searchQuery.toLowerCase()) || c.model.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [cars, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24" dir="rtl">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <main className="max-w-7xl mx-auto p-6 md:p-10 text-right">
        {view === 'inventory' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard label="المخزون المتاح" val={stats?.inventory?.available || 0} unit="سيارة" icon={Briefcase} color="text-indigo-600" bg="bg-indigo-50" />
              <StatsCard label="إجمالي الأرباح" val={stats?.financials?.totalProfit || 0} unit="دج" icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" />
              <StatsCard label="قيمة المخزون" val={stats?.financials?.stockValue || 0} unit="دج" icon={BarChart3} color="text-amber-600" bg="bg-amber-50" />
              <StatsCard label="سيارات مباعة" val={stats?.inventory?.sold || 0} unit="سيارة" icon={TrendingUp} color="text-rose-600" bg="bg-rose-50" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                <h2 className="text-2xl font-black text-slate-900">إدارة المخزون</h2>
              </div>
              <button onClick={() => setView('add')} className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 transition-all">
                <Plus size={20} /> إضافة سيارة جديدة
              </button>
            </div>

            {!cars ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="text-slate-400 font-black">جاري مزامنة البيانات...</p>
              </div>
            ) : filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {filteredCars.map((car: any) => <CarCard key={car._id} car={car} onDelete={handleDeleteCar} />)}
              </div>
            ) : (
              <div className="bg-white rounded-[4rem] p-32 text-center border-2 border-dashed border-slate-200">
                <Search size={48} className="mx-auto text-slate-200 mb-6" />
                <h3 className="text-2xl font-black text-slate-400">لا توجد نتائج بحث</h3>
              </div>
            )}
          </div>
        ) : (
          <AddCarForm 
            step={step} setStep={setStep} formData={formData} setFormData={setFormData}
            previewImage={previewImage} isUploading={isUploading} isSubmitting={isSubmitting}
            handleImageUpload={handleImageUpload} handleAddCar={handleAddCar}
            onClose={() => setView('inventory')}
          />
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-xl border-t border-slate-100 py-4 px-10 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Convex: Connected</span>
            <span className="flex items-center gap-2"><AlertCircle size={12} className="text-indigo-500" /> System Admin</span>
          </div>
          <div>Motorix Intelligence System</div>
        </div>
      </footer>
    </div>
  );
}