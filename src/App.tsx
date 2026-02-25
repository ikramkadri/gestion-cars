import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { 
  LayoutDashboard, CarFront, TrendingUp, 
  BadgeDollarSign, Trash2, PlusCircle, 
  UserCircle, Lock, Eye
} from "lucide-react";

export default function CarManagementSystem() {
  // محاكاة حالة المستخدم (في مشروع حقيقي نأتي بها من Auth)
  const [currentUser, setCurrentUser] = useState({ id: "user_123", role: "admin" });

  // 1. استدعاء البيانات (نمرر الـ role للتحكم في العرض)
  const stats = useQuery(api.statistics.getDashboardStats);
  const cars = useQuery(api.cars.getAllCars);
  const deleteCarMutation = useMutation(api.cars.deleteCar);

  const isAdmin = currentUser.role === "admin";

  const handleDelete = async (id: any) => {
    if (!isAdmin) return alert("ليس لديك صلاحية الحذف!");
    if (window.confirm("هل أنت متأكد من حذف هذه السيارة؟")) {
      try {
        await deleteCarMutation({ id });
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  if (!cars) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-right text-slate-900" dir="rtl">
      
      {/* شريط التنقل العلوي (Navbar) */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <CarFront size={22} />
            </div>
            <span className="text-xl font-black tracking-tight">CAR<span className="text-blue-600">PRO</span></span>
          </div>

          {/* محاكي تبديل الرتب (للتجربة فقط) */}
          <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setCurrentUser({ id: "u1", role: "admin" })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isAdmin ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              مدير (Admin)
            </button>
            <button 
              onClick={() => setCurrentUser({ id: "u2", role: "guest" })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!isAdmin ? 'bg-white shadow-sm text-slate-600' : 'text-slate-500'}`}
            >
              زائر (Guest)
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* قسم الترحيب */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800">مرحباً بك في نظام الإدارة</h1>
            <p className="text-slate-500 mt-1">أنت تتصفح النظام الآن بصلاحية: 
              <span className={`mr-2 font-bold ${isAdmin ? 'text-blue-600' : 'text-amber-600'}`}>
                {isAdmin ? 'مدير كامل الصلاحيات' : 'زائر (مشاهدة فقط)'}
              </span>
            </p>
          </div>
          {isAdmin && (
            <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200">
              <PlusCircle size={20} />
              إضافة سيارة للمخزن
            </button>
          )}
        </header>

        {/* قسم الإحصائيات: يظهر فقط للـ Admin */}
        {isAdmin ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats ? (
              <>
                <StatCard title="السيارات المتوفرة" value={stats.inventory.available} icon={<CarFront className="text-blue-600" />} />
                <StatCard title="السيارات المبيوعة" value={stats.inventory.sold} icon={<TrendingUp className="text-emerald-600" />} />
                <StatCard title="إجمالي المداخيل" value={`${stats.financials.totalRevenue.toLocaleString()} دج`} icon={<BadgeDollarSign className="text-amber-500" />} />
                <StatCard title="صافي الأرباح" value={`${stats.financials.totalProfit.toLocaleString()} دج`} icon={<TrendingUp className="text-rose-600" />} highlight />
              </>
            ) : (
              <div className="col-span-full h-32 bg-white rounded-3xl animate-pulse" />
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl mb-10 flex items-center gap-4 text-amber-800">
            <Lock size={24} />
            <p className="font-bold">الإحصائيات المالية مخفية. يجب تسجيل الدخول كمدير لرؤية الأرباح والمداخيل.</p>
          </div>
        )}

        {/* جدول السيارات */}
        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">المخزون الحالي</h2>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Eye size={16} />
              <span>عرض {cars.length} سيارة</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-black tracking-widest">
                  <th className="px-8 py-4">معلومات السيارة</th>
                  <th className="px-8 py-4">سعر البيع</th>
                  <th className="px-8 py-4 text-center">الحالة</th>
                  {isAdmin && <th className="px-8 py-4 text-left">إجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cars.map((car) => (
                  <tr key={car._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-black text-slate-700 text-lg">{car.make} {car.model}</div>
                      <div className="text-slate-400 text-sm font-medium">سنة الصنع: {car.year} | المسافة: {car.mileage} كم</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-mono font-bold text-blue-600 text-lg">{car.price.toLocaleString()} <span className="text-[10px]">دج</span></div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase ${
                        car.status === "Available" ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {car.status === "Available" ? "متوفرة" : "مبيوعة"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-8 py-5 text-left">
                        <button 
                          onClick={() => handleDelete(car._id)}
                          className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

// مكونات مساعدة (Sub-components)
function StatCard({ title, value, icon, highlight = false }: any) {
  return (
    <div className={`p-8 rounded-[2rem] border transition-all duration-300 hover:scale-[1.02] ${
      highlight ? 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-slate-300' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${highlight ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
          {icon}
        </div>
      </div>
      <p className={`text-xs font-black uppercase tracking-widest ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
      <h3 className="text-3xl font-black mt-2 tracking-tight">{value}</h3>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 animate-pulse">CARPRO يتم التحميل</p>
    </div>
  );
}