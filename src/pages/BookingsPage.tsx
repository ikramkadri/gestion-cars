import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id, Doc } from '../../convex/_generated/dataModel';
import { CarType } from '../features/cars/types/car.types';
import { 
  Calendar, Clock, Car, User, XCircle, Ban, DollarSign, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast'; // Removed unused imports
import SaleFormModal from '../components/SaleFormModal'; // Corrected import path
import { BookingWithDetails } from '../types/app'; // Import from types/app (already correct)

const BookingsPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  
  const bookings = useQuery(api.bookings.getPendingBookings, { token }) as BookingWithDetails[] | undefined;
  const cancelBooking = useMutation(api.bookings.cancelBooking);
  const rejectBooking = useMutation(api.bookings.rejectBooking);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null); // Already typed correctly

  const handleCancel = async (id: Id<"bookings">) => {
    if (!window.confirm("هل أنت متأكد من إلغاء هذا الحجز؟")) return;
    try {
      await cancelBooking({ token, bookingId: id });
      toast.success("تم إلغاء الحجز وإتاحة السيارة مجدداً");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الإلغاء.");
    }
  };

  const handleReject = async (id: Id<"bookings">) => { // Already typed correctly
    const reason = window.prompt("يرجى كتابة سبب رفض الحجز للزبون:");
    if (reason === null) return; // تم إلغاء العملية
    if (reason.trim() === "") return toast.error("يجب كتابة سبب الرفض.");

    try {
      await rejectBooking({ token, bookingId: id, reason });
      toast.success("تم رفض الحجز وإبلاغ الزبون بنجاح.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الرفض.");
    }
  };

  const openSaleModal = (booking: BookingWithDetails) => { // Already typed correctly
    setSelectedBooking(booking);
    setIsSaleModalOpen(true);
  };

  if (bookings === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans text-right" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">إدارة الحجوزات</h1>
        <p className="text-slate-500 font-bold italic">طلبات الحجز المعلقة من قبل الزبائن</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {bookings.length > 0 ? bookings.map((booking: BookingWithDetails) => ( // Already typed correctly
          <div key={booking._id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Car size={32} />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">{booking.carDetails?.make} {booking.carDetails?.model}</h3>
                <p className="text-sm font-bold text-slate-400">السعر المعروض: {booking.carDetails?.price?.toLocaleString()} دج</p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto px-6 md:border-r border-slate-50">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <User size={20} />
              </div>
              <div>
                <p className="font-black text-slate-800 text-sm">{booking.clientDetails?.fullName}</p>
                <p className="text-xs font-bold text-slate-400">{booking.clientDetails?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                  <Calendar size={14} />
                  <span>تاريخ الحجز: {new Date(booking.createdAt).toLocaleDateString('ar-DZ')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Clock size={14} />
                  <span>{new Date(booking.createdAt).toLocaleTimeString('ar-DZ')}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => openSaleModal(booking)}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200"
                >
                  <DollarSign size={16} /> إتمام البيع
                </button>
                <button 
                  onClick={() => handleReject(booking._id)}
                  className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-black text-xs hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center gap-2"
                >
                  <Ban size={16} /> رفض
                </button>
                <button 
                  onClick={() => handleCancel(booking._id)}
                  className="bg-rose-50 text-rose-600 px-6 py-3 rounded-xl font-black text-xs hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <XCircle size={16} /> إلغاء
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-slate-200">
            <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold italic">لا توجد حجوزات معلقة حالياً.</p>
          </div>
        )}
      </div>

      <SaleFormModal 
        isOpen={isSaleModalOpen} 
        onClose={() => setIsSaleModalOpen(false)} 
        initialData={selectedBooking}
      />
    </div>
  );
};

export default BookingsPage;