import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Car, 
  DollarSign, 
  Calendar, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Gauge
} from "lucide-react";

const AdminCars = () => {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // الربط الحقيقي مع Convex Backend
  const cars = useQuery(api.cars.getPublicCars, { searchQuery });
  const addCarMutation = useMutation(api.cars.addCar);
  const archiveCarMutation = useMutation(api.cars.archiveCar);

  // حالة النموذج لإضافة سيارة
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    purchasePrice: '',
    mileage: '',
    condition: 'Excellent' as const,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
  });

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ type: 'loading', text: 'جاري إضافة السيارة إلى النظام...' });
    
    try {
      await addCarMutation({
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        price: Number(formData.price),
        purchasePrice: Number(formData.purchasePrice),
        mileage: Number(formData.mileage),
        condition: formData.condition,
        imageUrl: formData.imageUrl
      });
      
      setStatusMsg({ type: 'success', text: 'تمت إضافة السيارة بنجاح!' });
      setIsModalOpen(false);
      // إعادة ضبط النموذج
      setFormData({ 
        make: '', model: '', year: 2024, price: '', 
        purchasePrice: '', mileage: '', condition: 'Excellent', 
        imageUrl: formData.imageUrl 
      });
      
      // إخفاء رسالة النجاح بعد 3 ثواني
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'فشلت الإضافة. تأكد أن حسابك مسجل كـ Admin' });
    }
  };

  const handleArchive = async (id: any) => {
    if (window.confirm("هل أنت متأكد من أرشفة هذه السيارة؟ لن تظهر للزبائن بعد الآن.")) {
      try {
        await archiveCarMutation({ id });
        setStatusMsg({ type: 'success', text: 'تم نقل السيارة للأرشيف' });
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      } catch (error) {
        setStatusMsg({ type: 'error', text: 'فشلت عملية الأرشفة' });
      }
    }
  };

  if (cars === undefined) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة السيارات</h1>
          <p className="text-gray-500 font-medium">مرحباً {user?.fullName || 'أدمن'}، يمكنك التحكم في المخزون هنا.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-200 font-bold"
        >
          <Plus size={20} />
          إضافة سيارة جديدة
        </button>
      </div>

      {/* البحث */}
      <div className="relative mb-8 max-w-2xl">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="ابحث بالماركة، الموديل أو سنة الصنع..." 
          className="w-full pr-12 pl-4 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* شبكة عرض السيارات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.length > 0 ? (
          cars.map((car: any) => (
            <div key={car._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-52 overflow-hidden">
                <img src={car.imageUrl} alt={car.make} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                  <span className={`text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg ${
                    car.condition === 'Excellent' ? 'bg-green-500' : 'bg-orange-500'
                  }`}>
                    {car.condition}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{car.make} {car.model}</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <Calendar size={16} className="text-blue-500"/> 
                    <span>{car.year}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <Gauge size={16} className="text-blue-500"/> 
                    <span>{car.mileage} كم</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="text-blue-600 font-black text-lg">
                    {car.price.toLocaleString()} دج
                  </div>
                  <button 
                    onClick={() => handleArchive(car._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="أرشفة السيارة"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Car size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold">لا توجد سيارات تطابق بحثك حالياً</p>
          </div>
        )}
      </div>

      {/* مودال إضافة سيارة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative animate-in zoom-in duration-300">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute left-6 top-6 text-gray-400 hover:text-gray-900 transition-colors p-2"
            >
              <X size={28} />
            </button>
            
            <div className="mb-8 mt-2">
              <h2 className="text-2xl font-black text-gray-800">إضافة سيارة جديدة للمخزن</h2>
              <p className="text-gray-500">يرجى ملء كافة الحقول بعناية.</p>
            </div>

            <form onSubmit={handleAddCar} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 mr-1">الماركة</label>
                <input required type="text" placeholder="Toyota, Hyundai..." className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 mr-1">الموديل</label>
                <input required type="text" placeholder="Corolla, Accent..." className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 mr-1">سنة الصنع</label>
                <input required type="number" className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 mr-1">سعر البيع (دج)</label>
                <input required type="number" className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600" 
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 mr-1 text-red-600">سعر الشراء (سري)</label>
                <input required type="number" className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 mr-1">المسافة (كم)</label>
                <input required type="number" className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700 mr-1">رابط صورة السيارة</label>
                <input required type="text" className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>
              
              <div className="md:col-span-2 mt-6 flex gap-3">
                <button type="submit" disabled={statusMsg.type === 'loading'} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2">
                  {statusMsg.type === 'loading' && <Loader2 className="animate-spin" size={20} />}
                  تأكيد الإضافة للمخزن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* رسائل الحالة (Toast) */}
      {statusMsg.text && (
        <div className={`fixed bottom-10 left-10 p-5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-10 z-[100] ${
          statusMsg.type === 'success' ? 'bg-green-600 text-white' : 
          statusMsg.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={24} /> : statusMsg.type === 'error' ? <AlertCircle size={24} /> : <Loader2 className="animate-spin" size={24} />}
          <span className="font-bold text-lg">{statusMsg.text}</span>
        </div>
      )}
    </div>
  );
};

export default AdminCars;