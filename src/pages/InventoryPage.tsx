import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Car, 
  DollarSign,
  Plus, 
  Search, 
  Clock,
  CheckCircle2,
  Package,
  List as ListIcon,
  Trash2, 
  Edit3,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Id } from "../../convex/_generated/dataModel";
import { CarType } from '../features/cars/types/car.types';
import StatsCard from '../components/StatsCard'; // استيراد مكون بطاقة الإحصائيات الموحد
import SaleFormModal from '../components/SaleFormModal';
import Confetti from 'react-confetti'; // استيراد مكون القصاصات
import { useWindowSize } from 'react-use'; // استيراد هوك لمعرفة أبعاد النافذة
import { useLang } from '../lib/LanguageContext';

const InventoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [carConditionFilter, setCarConditionFilter] = useState<"All" | "New" | "Used">("All");
  const { language: lang } = useLang();
  
  const statusLabels = {
    ar: { available: "متاح للبيع", reserved: "محجوزة حالياً", sold: "تم البيع" },
    fr: { available: "Disponible", reserved: "Réservé", sold: "Vendu" },
    en: { available: "Available", reserved: "Reserved", sold: "Sold" }
  };
  const sl = statusLabels[lang as 'ar' | 'fr' | 'en'] || statusLabels.ar;

  const navigate = useNavigate();
  
  const token = localStorage.getItem("convex_token") ?? undefined;
  const user = useQuery(api.users.viewer, { token });

  // جلب البيانات من الباك اند (Convex)
  const cars = useQuery(api.cars.getCars, token ? { includeArchived: false, condition: carConditionFilter } : "skip"); 
  const stats = useQuery(api.statistics.getDashboardStats, { token });
  const updateCar = useMutation(api.cars.updateCar);
  const removeCar = useMutation(api.cars.deleteCar);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false); // حالة جديدة للتحكم في القصاصات
  const { width, height } = useWindowSize(); // للحصول على أبعاد الشاشة للقصاصات
  const [selectedCarIdForSale, setSelectedCarIdForSale] = useState<Id<"cars"> | null>(null);

  const filteredCars: CarType[] = (cars as CarType[] || [])?.filter((car: CarType) => 
    car.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
    car.model.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async (id: Id<"cars">) => {
    if (window.confirm("هل أنت متأكد من حذف هذه السيارة؟")) {
      const toastId = toast.loading("جاري حذف السيارة وصورها...");
      try {
        const token = localStorage.getItem("convex_token") || "";
        await removeCar({ carId: id, token: token }); // Ensure token is passed
        toast.success("تم حذف السيارة بنجاح", { id: toastId });
      } catch (error: unknown) {
        console.error("Delete error:", error);
        toast.error("فشل حذف السيارة، يرجى المحاولة لاحقاً", { id: toastId });
      }
    }
  };

  const handleResetStatus = async (id: Id<"cars">, name: string) => {
    if (window.confirm(`هل تريد إعادة السيارة "${name}" للحالة "متاحة للبيع"؟`)) {
      const toastId = toast.loading("جاري تحديث الحالة...");
      try {
        const token = localStorage.getItem("convex_token") || "";
        await updateCar({ 
          token, 
          carId: id, 
          updates: { status: "Available", isArchived: false } 
        });
        toast.success("السيارة عادت للسوق بنجاح ✅", { id: toastId });
      } catch {
        toast.error("فشل التحديث", { id: toastId });
      }
    }
  };

  const handleOpenSaleModal = (carId: Id<"cars">) => {
    setSelectedCarIdForSale(carId);
    setIsSaleModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-4 md:p-8 font-sans text-right" dir="rtl">
      {/* العنوان والبحث */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
            <Package size={14} /> نظام تتبع الأسطول الذكي
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
            إدارة <span className="text-indigo-600">المخزون</span>
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text"
              placeholder="ابحث بالماركة أو الموديل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 pr-11 pl-4 py-3 rounded-2xl w-full md:w-72 focus:ring-2 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 transition-all shadow-sm text-right"
            />
          </div>
          {user?.role !== "viewer" && (
            <button 
              onClick={() => navigate("/admin/inventory/add")}
              className="bg-indigo-600 text-white flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all font-black"
            >
              <Plus size={20} /> إضافة مركبة
            </button>
          )}
        </div>
      </div>

      {/* فلاتر الحالة (جديد / مستعمل) */}
      <div className="flex justify-center md:justify-start gap-3 mb-10">
        <button
          onClick={() => setCarConditionFilter("All")}
          className={`px-6 py-2 rounded-full text-sm font-black transition-all ${
            carConditionFilter === "All" ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          كل السيارات
        </button>
        <button
          onClick={() => setCarConditionFilter("New")}
          className={`px-6 py-2 rounded-full text-sm font-black transition-all ${
            carConditionFilter === "New" ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          جديد
        </button>
        <button
          onClick={() => setCarConditionFilter("Used")}
          className={`px-6 py-2 rounded-full text-sm font-black transition-all ${
            carConditionFilter === "Used" ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          مستعمل
        </button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          icon={Car} 
          bg="bg-slate-900" 
          color="text-white"
          label="إجمالي الأسطول" 
          val={stats?.inventory.total.toString() ?? "..."}
          unit="سيارة"
        />
        <StatsCard 
          icon={CheckCircle2} 
          bg="bg-emerald-500" 
          color="text-white"
          label="متوفر للبيع" 
          val={stats?.inventory.available.toString() ?? "..."} 
          unit="سيارة"
        />
        <StatsCard 
          icon={DollarSign} 
          bg="bg-blue-600" 
          color="text-white"
          label="قيمة المخزون الكلية" 
          val={stats ? (stats.financials.stockValue / 1000000).toFixed(1) : "..."} 
          unit="M د.ج"
        />
        <StatsCard 
          icon={Clock} 
          bg="bg-amber-500" 
          color="text-white"
          label="قيد الانتظار" 
          val={stats?.inventory.reserved.toString() ?? "..."} 
          unit="سيارة"
        />
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <ListIcon className="text-indigo-600" size={20} />
            </div>
            <h2 className="font-black text-slate-800">قائمة المركبات الحالية</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-50 bg-slate-50/30">
                <th className="px-8 py-5">المركبة</th>
                <th className="px-8 py-5">المواصفات</th>
                <th className="px-8 py-5 text-right">السعر المعروض</th>
                <th className="px-8 py-5 text-right">الحالة</th>
                {user?.role !== "viewer" && <th className="px-8 py-5 text-right">الإجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCars.map((car: CarType) => (
                <tr key={car._id} className="hover:bg-slate-50/80 transition-all group">
                  <td 
                    className="px-8 py-5 cursor-pointer"
                    onClick={() => navigate(`/admin/inventory/${car._id}`)}
                  >
                    <div className="flex items-center gap-4 group/item">
                      <div className="w-14 h-10 rounded-lg bg-slate-100 overflow-hidden border border-transparent group-hover/item:border-indigo-500 transition-all">
                        <img 
                          src={car.mainImageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=150"} 
                          className="w-full h-full object-cover"
                          alt="صورة السيارة"
                        />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 group-hover/item:text-indigo-600 transition-colors">{car.make} {car.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-600 italic">سنة الصنع: {car.year}</span>
                      <span className="text-[10px] text-slate-400 font-black">{car.color || 'غير محدد'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900 tabular-nums">
                    {(car.price || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">د.ج</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                      car.status === "Available" 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : car.status === "Reserved"
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {car.status === "Available" ? sl.available : car.status === "Reserved" ? sl.reserved : sl.sold}
                    </span>
                  </td>
                  {user?.role !== "viewer" && (
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 justify-end">
                        {user?.role === "admin" && car.status !== "Available" && (
                          <button 
                            onClick={() => handleResetStatus(car._id, `${car.make} ${car.model}`)}
                            className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-300 transition-all"
                            title="إعادة السيارة متاحة للبيع"
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}
                        {(user?.role === "admin" || user?.role === "sales_manager") && 
                         (car.status === "Available" || car.status === "Reserved") && (
                          <button 
                            onClick={() => handleOpenSaleModal(car._id)}
                            className="p-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-300 transition-all"
                            title="إتمام عملية البيع"
                          >
                            <DollarSign size={16} />
                          </button>
                        )}
                        {(user?.role === "admin" || user?.role === "sales_manager") && (
                          <button 
                            onClick={() => navigate(`/admin/inventory/edit/${car._id}`)}
                            className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-300 transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                        {user?.role === "admin" && (
                          <button 
                            onClick={() => handleDelete(car._id)}
                            className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-300 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredCars.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-300 font-bold italic">
                    لا يوجد بيانات لعرضها حالياً..
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SaleFormModal 
        isOpen={isSaleModalOpen} 
        key={selectedCarIdForSale || 'new-sale'} 
        onClose={() => {
          setIsSaleModalOpen(false);
          setSelectedCarIdForSale(null);
        }} 
        setShowConfetti={setShowConfetti} // تمرير دالة التحكم في القصاصات (الآن هي اختيارية في المكون)
        preSelectedCarId={selectedCarIdForSale}
      />

      {/* تأثير القصاصات الملونة عند النجاح (يظهر في الخلفية) */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={300}
          recycle={false}
          gravity={0.2}
          style={{ zIndex: 5000, position: 'fixed', top: 0, left: 0 }} // رفع الـ zIndex فوق كل شيء
        />
      )}
    </div>
  );
};

export default InventoryPage;