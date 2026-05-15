import { Archive, Search, Car } from 'lucide-react';

const ArchivedInventoryPage = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans text-right" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Archive className="text-slate-400" size={32} /> أرشيف المركبات
        </h1>
        <p className="text-slate-500 font-bold italic">جميع السيارات المباعة أو التي تم أرشفتها من المخزون النشط</p>
      </div>

      <div className="relative max-w-md mb-12">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="ابحث في الأرشيف عن سيارة، رقم شاصي..."
          className="w-full pr-12 pl-4 py-3 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-slate-400 transition-all"
        />
      </div>

      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Car className="text-slate-200" size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-400">الأرشيف فارغ حالياً</h2>
        <p className="text-slate-300 font-bold mt-2 text-sm text-center max-w-xs">
          السيارات التي ستقوم بنقلها للأرشيف ستظهر هنا لإدارة سجلاتها التاريخية.
        </p>
      </div>
    </div>
  );
};

export default ArchivedInventoryPage;