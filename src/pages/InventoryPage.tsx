import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// استخدام الاستيرادات المطلوبة مع العلم أنها قد تسبب خطأ في المعاينة الفورية 
// ولكنها ضرورية لبيئتك المحلية (Local Environment)
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Car, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Search, 
  Clock,
  CheckCircle2,
  Package,
  List as ListIcon,
  Trash2,
  Edit3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Id } from "../../convex/_generated/dataModel";
import { CarType } from '../features/cars/types/car.types';

interface StatCardProps {
  icon: React.ElementType;
  color: string;
  label: string;
  value: string | number;
  trend?: string;
  isUp?: boolean;
}

const StatCard = ({ icon: Icon, color, label, value, trend, isUp }: StatCardProps) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg shadow-current/20`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-black ${isUp ? 'text-emerald-500' : 'text-rose-500'} bg-slate-50 px-3 py-1.5 rounded-full`}>
          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend}
        </div>
      )}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
        {value}
      </h3>
    </div>
  </div>
);

const InventoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const token = localStorage.getItem("convex_token") ?? undefined;
  const user = useQuery(api.users.viewer, { token });

  // جلب البيانات من الباك اند (Convex)
  const cars = useQuery(api.cars.getCars, { includeArchived: false });
  const stats = useQuery(api.statistics.getDashboardStats);
  const removeCar = useMutation(api.cars.deleteCar);

  // تصفية البيانات بناءً على البحث
  const filteredCars: CarType[] = (cars as CarType[] || [])?.filter((car: CarType) => 
    car.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
    car.model.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async (id: Id<"cars">) => {
    if (window.confirm("هل أنت متأكد من حذف هذه السيارة؟")) {
      const toastId = toast.loading("جاري حذف السيارة وصورها...");
      try {
        const token = localStorage.getItem("convex_token") || "";
        await removeCar({ carId: id, token });
        toast.success("تم حذف السيارة بنجاح", { id: toastId });
      } catch (error) {
        console.error("خطأ أثناء الحذف:", error);
        toast.error("فشل حذف السيارة، يرجى المحاولة لاحقاً", { id: toastId });
      }
    }
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

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          icon={Car} 
          color="bg-slate-900" 
          label="إجمالي الأسطول" 
          value={stats?.inventory.total ?? "..."}
          trend="+12%" 
          isUp={true} 
        />
        <StatCard 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
          label="متوفر للبيع" 
          value={stats?.inventory.available ?? "..."} 
        />
        <StatCard 
          icon={DollarSign} 
          color="bg-blue-600" 
          label="قيمة المخزون" 
          value={stats ? `${(stats.financials.stockValue / 1000).toFixed(0)}K` : "..."} 
        />
        <StatCard 
          icon={Clock} 
          color="bg-amber-500" 
          label="قيد الانتظار" 
          value={stats?.inventory.reserved ?? "..."} 
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
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-10 rounded-lg bg-slate-100 overflow-hidden">
                        <img 
                          src={car.mainImageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=150"} 
                          className="w-full h-full object-cover"
                          alt="صورة السيارة"
                        />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">{car.make} {car.model}</div>
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
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {car.status === "Available" ? "متاح" : "مباع"}
                    </span>
                  </td>
                  {user?.role !== "viewer" && (
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 justify-end">
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
    </div>
  );
};

export default InventoryPage;