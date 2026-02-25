import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { 
  LayoutDashboard, 
  CarFront, 
  TrendingUp, 
  BadgeDollarSign, 
  Trash2, 
  PlusCircle 
} from "lucide-react";

export default function CarManagementSystem() {
  // 1. استدعاء البيانات من الباك آند (بدون تغيير الأسماء)
  const stats = useQuery(api.statistics.getDashboardStats);
  const cars = useQuery(api.cars.getAllCars); // اسم الدالة كما هو في ملفك
  const deleteCarMutation = useMutation(api.cars.deleteCar);

  // دالة الحذف مع التعامل مع الخطأ (في حال كانت السيارة مبيوعة)
  const handleDelete = async (id: any) => {
    if (window.confirm("هل أنت متأكد من حذف هذه السيارة؟")) {
      try {
        await deleteCarMutation({ id });
      } catch (error: any) {
        alert(error.message); // ستظهر رسالة "لا يمكن حذف سيارة مبيوعة" التي برمجتيها
      }
    }
  };

  if (!stats || !cars) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 font-sans text-slate-500">
      جاري تحميل النظام...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-right" dir="rtl">
      
      {/* الرأس (Header) */}
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">لوحة تحكم المعرض</h1>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100">
          <PlusCircle size={20} />
          إضافة سيارة
        </button>
      </header>

      {/* قسم الإحصائيات (من ملف statistics.ts) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="المتوفر" value={stats.inventory.available} icon={<CarFront className="text-blue-600" />} />
        <StatCard title="المبيعات" value={stats.inventory.sold} icon={<TrendingUp className="text-emerald-600" />} />
        <StatCard title="إجمالي المداخيل" value={`${stats.financials.totalRevenue.toLocaleString()} دج`} icon={<BadgeDollarSign className="text-amber-500" />} />
        <StatCard title="صافي الأرباح" value={`${stats.financials.totalProfit.toLocaleString()} دج`} icon={<TrendingUp className="text-rose-600" />} highlight />
      </div>

      {/* جدول السيارات (من ملف cars.ts) */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">إدارة المخزون الحالي</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">السيارة</th>
                <th className="px-6 py-4">السعر المعروض</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cars.map((car) => (
                <tr key={car._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {car.make} {car.model} <span className="text-slate-400 font-normal text-sm">({car.year})</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">{car.price.toLocaleString()} دج</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                      car.status === "Available" ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {car.status === "Available" ? "متوفرة" : "مبيوعة"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <button 
                      onClick={() => handleDelete(car._id)}
                      className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                      title="حذف السيارة"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// مكون البطاقة (StatCard)
function StatCard({ title, value, icon, highlight = false }: any) {
  return (
    <div className={`p-6 rounded-3xl border transition-all ${
      highlight ? 'bg-slate-900 border-slate-800 text-white shadow-xl shadow-slate-200' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-2xl ${highlight ? 'bg-slate-800' : 'bg-slate-50'}`}>
          {icon}
        </div>
      </div>
      <p className={`text-xs font-bold ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
      <h3 className="text-2xl font-black mt-1 tracking-tight">{value}</h3>
    </div>
  );
}

// src/App.tsx (مثال مبسط)
function Dashboard() {
  const user = { role: "guest" }; // هذا سنأتي به من حالة تسجيل الدخول لاحقاً

  if (user.role === "guest") {
    return <h1>عذراً، يمكنك فقط تصفح السيارات، لا يمكنك رؤية الإحصائيات.</h1>;
  }

  return (
    // كود الـ Dashboard الجميل الذي صممناه
  );
}