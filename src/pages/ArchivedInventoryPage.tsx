import { useState } from 'react';
import { Archive, Search, Car, Loader2, RotateCcw } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'react-hot-toast';
import { Id } from '../../convex/_generated/dataModel';

const ArchivedInventoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const cars = useQuery(api.cars.getCars, { includeArchived: true });
  const updateCar = useMutation(api.cars.updateCar);

  const filteredCars = cars?.filter(car => 
    car.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
    car.model.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleRestore = async (id: Id<"cars">) => {
    const token = localStorage.getItem("convex_token") || "";
    try {
      await updateCar({
        token,
        carId: id,
        updates: { isArchived: false, status: "Available" }
      });
      toast.success("تمت استعادة السيارة للمخزون النشط ✅");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "فشل في استعادة السيارة");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-slate-950 p-8 font-sans text-right transition-colors duration-300" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Archive className="text-slate-400 dark:text-slate-500" size={32} /> أرشيف المركبات
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold italic">جميع السيارات المباعة أو التي تم أرشفتها من المخزون النشط</p>
      </div>

      <div className="relative max-w-md mb-12">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="ابحث في الأرشيف عن سيارة، رقم شاصي..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-12 pl-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-800 dark:text-white rounded-2xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-505 transition-all"
        />
      </div>

      {cars === undefined ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={40} />
        </div>
      ) : filteredCars.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">المركبة</th>
                <th className="px-8 py-4 text-right">السعر النهائي</th>
                <th className="px-8 py-4 text-right">الحالة</th>
                <th className="px-8 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
              {filteredCars.map((car) => (
                <tr key={car._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img src={car.mainImageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=150"} className="w-full h-full object-cover" alt="" />
                      </div>
                      <span className="font-black text-slate-800 dark:text-slate-200">{car.make} {car.model}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900 dark:text-white tabular-nums text-right">
                    {car.price.toLocaleString()} <span className="text-[10px] text-slate-400 dark:text-slate-500">دج</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${car.status === "Sold" ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                      {car.status === "Sold" ? "مباعة" : "مؤرشفة"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleRestore(car._id)}
                        className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all shadow-sm cursor-pointer"
                        title="استعادة السيارة للمخزون"
                      >
                        <RotateCcw size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-200 dark:text-slate-700">
            <Car size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-400 dark:text-slate-500">الأرشيف فارغ حالياً</h2>
          <p className="text-slate-300 dark:text-slate-650 font-bold mt-2 text-sm text-center max-w-xs">
            السيارات التي ستقوم بنقلها للأرشيف ستظهر هنا لإدارة سجلاتها التاريخية.
          </p>
        </div>
      )}
    </div>
  );
};

export default ArchivedInventoryPage;