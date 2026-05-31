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
  const { t, language, isRtl } = useLang();
  const statusLabels = {
    ar: { available: "متاح للبيع", reserved: "محجوزة حالياً", sold: "تم البيع" },
    fr: { available: "Disponible", reserved: "Réservé", sold: "Vendu" },
    en: { available: "Available", reserved: "Reserved", sold: "Sold" }
  };
  const sl = statusLabels[language as 'ar' | 'fr' | 'en'] || statusLabels.ar;
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
    if (window.confirm(t('inventory_delete_confirm'))) {
      const toastId = toast.loading(t('inventory_delete_loading'));
      try {
        const token = localStorage.getItem("convex_token") || "";
        await removeCar({ carId: id, token: token });
        toast.success(t('inventory_delete_success'), { id: toastId });
      } catch (error: unknown) {
        console.error("Delete error:", error);
        toast.error(t('inventory_delete_error'), { id: toastId });
      }
    }
  };

  const handleResetStatus = async (id: Id<"cars">, name: string) => {
    if (window.confirm(t('inventory_status_restore_confirm').replace('{name}', name))) {
      const toastId = toast.loading(t('inventory_status_restore_loading'));
      try {
        const token = localStorage.getItem("convex_token") || "";
        await updateCar({ 
          token, 
          carId: id, 
          updates: { status: "Available", isArchived: false } 
        });
        toast.success(t('inventory_status_restore_success'), { id: toastId });
      } catch {
        toast.error(t('inventory_status_restore_error'), { id: toastId });
      }
    }
  };

  const handleOpenSaleModal = (carId: Id<"cars">) => {
    setSelectedCarIdForSale(carId);
    setIsSaleModalOpen(true);
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-background font-sans ${isRtl ? 'text-right' : 'text-left'} transition-colors duration-300`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* العنوان والبحث */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
            <Package size={14} /> {t('inventory_subtitle')}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            {t('inventory_title').split(' ')[0]} <span className="text-indigo-600">{t('inventory_title').split(' ').slice(1).join(' ')}</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-300`} size={18} />
            <input 
              type="text"
              placeholder={t('inventory_search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 ${isRtl ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} py-3 rounded-2xl w-full md:w-72 focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-blue-500/20 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm`}
            />
          </div>
          {user?.role !== "viewer" && (
            <button 
              onClick={() => navigate("/admin/inventory/add")}
              className="bg-indigo-600 text-white flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all font-black"
            >
              <Plus size={20} /> {t('nav_add_car')}
            </button>
          )}
        </div>
      </div>
      {/* فلاتر الحالة (جديد / مستعمل) */}
      <div className="flex justify-center md:justify-start gap-3 mb-10">
        <button
          onClick={() => setCarConditionFilter("All")}
          className={`px-6 py-2 rounded-full text-sm font-black transition-all ${
            carConditionFilter === "All" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          {t('inventory_filter_all')}
        </button>
        <button
          onClick={() => setCarConditionFilter("New")}
          className={`px-6 py-2 rounded-full text-sm font-black transition-all ${
            carConditionFilter === "New" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          {t('inventory_filter_new')}
        </button>
        <button
          onClick={() => setCarConditionFilter("Used")}
          className={`px-6 py-2 rounded-full text-sm font-black transition-all ${
            carConditionFilter === "Used" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          {t('inventory_filter_used')}
        </button>
      </div>
      {/* الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          icon={Car} 
          bg="bg-slate-900" 
          color="text-white"
          label={t('inventory_total_fleet')} 
          val={stats?.inventory.total.toString() ?? "..."}
          unit={t('dashboard_unit_car')}
        />
        <StatsCard 
          icon={CheckCircle2} 
          bg="bg-emerald-500" 
          color="text-white"
          label={t('dashboard_available_stock')} 
          val={stats?.inventory.available.toString() ?? "..."} 
          unit={t('dashboard_unit_car')}
        />
        <StatsCard 
          icon={DollarSign} 
          bg="bg-blue-600" 
          color="text-white"
          label={t('inventory_total_stock_value')} 
          val={stats ? (stats.financials.stockValue / 1000000).toFixed(1) : "..."} 
          unit={language === 'ar' ? 'مليون د.ج' : 'M DZD'}
        />
        <StatsCard 
          icon={Clock} 
          bg="bg-amber-500" 
          color="text-white"
          label={t('inventory_pending')} 
          val={stats?.inventory.reserved.toString() ?? "..."} 
          unit={t('dashboard_unit_car')}
        />
      </div>

      {/* الجدول */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <ListIcon className="text-indigo-600" size={20} />
            </div>
            <h2 className="font-black text-slate-800 dark:text-white">{t('inventory_list_title')}</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} border-collapse`}>
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-50 bg-slate-50/30">
                <th className="px-8 py-5">{t('dashboard_th_vehicle')}</th>
                <th className="px-8 py-5">{t('inventory_th_specifications')}</th>
                <th className={`px-8 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{t('inventory_th_price')}</th>
                <th className={`px-8 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{t('dashboard_th_status')}</th>
                {user?.role !== "viewer" && <th className={`px-8 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>{t('inventory_th_actions')}</th>}
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
                          alt={t('dashboard_th_vehicle')}
                        />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 group-hover/item:text-indigo-600 transition-colors">{car.make} {car.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-600 italic">{t('inventory_spec_year')}{car.year}</span>
                      <span className="text-[10px] text-slate-400 font-black">{car.color || t('inventory_spec_not_specified')}</span>
                    </div>
                  </td>
                  <td className={`px-8 py-5 font-black text-slate-900 tabular-nums ${isRtl ? 'text-right' : 'text-left'}`}>
                    {(car.price || 0).toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">{t('dzd')}</span>
                  </td>
                  <td className={`px-8 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>
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
                    <td className={`px-8 py-5 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-2 justify-end">
                        {user?.role === "admin" && car.status !== "Available" && (
                          <button 
                            onClick={() => handleResetStatus(car._id, `${car.make} ${car.model}`)}
                            className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-300 transition-all"
                            title={t('inventory_restore_btn_title')}
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}
                        {(user?.role === "admin" || user?.role === "sales_manager") && 
                         (car.status === "Available" || car.status === "Reserved") && (
                          <button 
                            onClick={() => handleOpenSaleModal(car._id)}
                            className="p-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-300 transition-all"
                            title={t('inventory_sell_btn_title')}
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
                  <td colSpan={user?.role === "viewer" ? 4 : 5} className="px-8 py-16 text-center text-slate-300 font-bold italic">
                    {t('inventory_no_data')}
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