import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Clock, CheckCircle2, FileText, Car, ArrowLeftRight, Loader2, Heart, Star, Send, X } from 'lucide-react';
import { SaleWithDetails } from '../types/app';
import InvoiceModal from './InvoiceModal';
import CarCard from '../components/CarCard';
import { CarType } from '../features/cars/types/car.types';
import { Id } from '../../convex/_generated/dataModel';

const OrdersPage = () => {
  const token = localStorage.getItem("convex_token") ?? undefined;
  const [activeTab, setActiveTab] = useState<'orders' | 'favorites'>('orders');
  
  // جلب حجوزات الزبون ومشترياته
  const bookings = useQuery(api.bookings.getMyBookings, token ? { token } : "skip");
  const sales = useQuery(api.sales.getRecentSales, token ? { token } : "skip") as SaleWithDetails[] | undefined;
  
  // جلب السيارات المفضلة
  const favorites = useQuery(api.favorites.getMyFavorites, token ? { token } : "skip");

  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // منطق التقييمات
  const addReview = useMutation(api.reviews.addReview);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState<{carId: string, carName: string} | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  if (bookings === undefined || sales === undefined || favorites === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  const handleReviewSubmit = async () => {
    if (!reviewComment.trim()) return toast.error("يرجى كتابة رأيك أولاً");
    try {
      await addReview({
        token: token || "",
        carId: reviewData?.carId as Id<"cars">,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success("شكراً لك! تقييمك يساهم في تحسين خدماتنا 🌟");
      setIsReviewOpen(false);
      setReviewComment("");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "فشل إرسال التقييم");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans text-right" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <ShoppingBag className="text-indigo-600" size={32} /> طلباتي ومشترياتي
        </h1>
        <p className="text-slate-500 font-bold mt-2">تتبع رحلة شراء سيارتك من الحجز إلى الاستلام</p>
      </div>

      {/* نظام التبويب (Tabs) */}
      <div className="flex gap-4 mb-8 bg-white w-fit p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          مشترياتي وحجوزاتي
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'favorites' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          مفضلاتي ❤️
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
        
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
                  <button 
                    onClick={() => {
                      setSelectedSale(sale);
                      setIsInvoiceOpen(true);
                    }}
                    className="flex items-center gap-2 text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <FileText size={14} /> تحميل الفاتورة
                  </button>
                  <button 
                    onClick={() => { setReviewData({carId: sale.carId, carName: sale.carName}); setIsReviewOpen(true); }}
                    className="flex items-center gap-2 text-xs font-black text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    <Star size={14} fill="currentColor" /> قيم تجربتك
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
      ) : (
        /* قسم المفضلات */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {favorites && favorites.some(f => f !== null) ? (
            favorites.map((car) => car && (
              <CarCard 
                key={car._id} 
                car={car as unknown as CarType} 
                showRemoveButton={true} 
              />
            ))
          ) : (
            <div className="col-span-full py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <Heart className="text-rose-200 mb-4" size={48} />
              <h2 className="text-xl font-black text-slate-400">قائمة المفضلات فارغة</h2>
              <p className="text-slate-300 font-bold mt-2">ابدأ باستكشاف السيارات وأضف ما يعجبك هنا!</p>
            </div>
          )}
        </div>
      )}

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

      <InvoiceModal 
        isOpen={isInvoiceOpen} 
        onClose={() => setIsInvoiceOpen(false)} 
        sale={selectedSale} 
      />

      {/* مودال التقييم الفاخر */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[400px] rounded-[2.5rem] shadow-2xl overflow-hidden relative border-t-[10px] border-amber-400">
            <button onClick={() => setIsReviewOpen(false)} className="absolute top-5 left-5 p-2 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-full transition-all border border-slate-100 shadow-sm">
              <X size={16} />
            </button>
            <div className="p-8 text-center border-b border-slate-50">
              <h3 className="font-black text-xl text-slate-900 flex items-center justify-center gap-2">
                <Star className="text-amber-500" fill="currentColor" /> قيم سيارتك الجديدة
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{reviewData?.carName}</p>
            </div>
            <div className="p-8 space-y-6 text-center">
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button 
                    key={num} 
                    onClick={() => setReviewRating(num)}
                    className={`transition-all hover:scale-125 ${reviewRating >= num ? 'text-amber-500 scale-110' : 'text-slate-200'}`}
                  >
                    <Star size={35} fill={reviewRating >= num ? "currentColor" : "none"} strokeWidth={2.5} />
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-blue-900 uppercase tracking-wider block text-right">رسالة شكر أو ملاحظة</label>
                <textarea 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="كيف كانت تجربتك مع فريق موتوريكس؟"
                  className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-amber-400 transition-colors font-bold text-sm h-28 resize-none text-right"
                />
              </div>
              <button 
                onClick={handleReviewSubmit}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-black shadow-xl hover:bg-blue-900 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Send size={18} /> إرسال التقييم الرسمي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;