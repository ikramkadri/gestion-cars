import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ShoppingBag, Clock, CheckCircle2, FileText, Car, ArrowLeftRight, Loader2 } from 'lucide-react';
import { SaleWithDetails } from '../types/app';

const OrdersPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  
  // جلب حجوزات الزبون ومشترياته
  const bookings = useQuery(api.bookings.getMyBookings, { token });
  const sales = useQuery(api.sales.getRecentSales, { token }) as SaleWithDetails[] | undefined;

  if (bookings === undefined || sales === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans text-right" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <ShoppingBag className="text-indigo-600" size={32} /> طلباتي ومشترياتي
        </h1>
        <p className="text-slate-500 font-bold mt-2">تتبع رحلة شراء سيارتك من الحجز إلى الاستلام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* قسم الحجوزات النشطة */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-4">
            <Clock className="text-amber-500" size={20} /> طلبات الحجز الحالية
          </h2>
          {bookings.length > 0 ? bookings.map((booking) => (
            <div key={booking._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-16 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Car size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-900">{booking.carDetails?.make} {booking.carDetails?.model}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">تاريخ الطلب: {new Date(booking.createdAt).toLocaleDateString('ar-DZ')}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                booking.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {booking.status === 'confirmed' ? 'مقبول' : booking.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
              </span>
            </div>
          )) : (
            <div className="bg-white p-10 rounded-[2rem] border border-dashed text-center text-slate-400 font-bold italic">
              لا توجد طلبات حجز نشطة..
            </div>
          )}
        </div>

        {/* قسم المشتريات المكتملة */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-emerald-500" size={20} /> السيارات المشتراة
          </h2>
          {sales && sales.length > 0 ? sales.map((sale) => (
            <div key={sale._id} className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <FileText size={100} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black">{sale.invoiceNumber}</div>
                  <div className="text-emerald-400 font-black text-sm">{sale.amountPaid.toLocaleString()} دج</div>
                </div>
                <h3 className="font-black text-lg mb-1">{sale.carName}</h3>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                  <button className="flex items-center gap-2 text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors">
                    <FileText size={14} /> تحميل الفاتورة
                  </button>
                  <button className="flex items-center gap-2 text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors">
                    <ArrowLeftRight size={14} /> تتبع النقل
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white p-10 rounded-[2rem] border border-dashed text-center text-slate-400 font-bold italic">
              ستظهر هنا فواتيرك بعد إتمام الشراء..
            </div>
          )}
        </div>

      </div>

      {/* منهاجي / خريطة الطريق (Loyalty Hint) */}
      <div className="mt-12 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
        <div className="text-center md:text-right">
          <h2 className="text-2xl font-black mb-2">رحلتك مع MOTORIX</h2>
          <p className="font-bold opacity-80 max-w-md">نحن هنا لنرافقك من أول حجز حتى الصيانة الدورية. يمكنك دائماً مراجعة وثائقك وضماناتك هنا.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex flex-col items-center gap-2 opacity-50">
              <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-black">1</div>
              <span className="text-[10px] font-black">الاكتشاف</span>
           </div>
           <div className="w-10 h-[2px] bg-white/20 mt-5" />
           <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-black">2</div>
              <span className="text-[10px] font-black">الملكية</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;