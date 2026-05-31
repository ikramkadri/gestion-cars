import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { 
  Calendar, Clock, Car, User, XCircle, Ban, DollarSign, Loader2, Mail, CheckCircle2,
  ListFilter, CheckCircle, Timer
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/bookings/ar.json';
import en from '../lib/i18n/pages/bookings/en.json';
import fr from '../lib/i18n/pages/bookings/fr.json';
import SaleFormModal from '../components/SaleFormModal';
import { BookingWithDetails } from '../types/app';

const BookingsPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed'>('pending');
  const { t } = usePageTranslation({ ar, en, fr });
  
  const bookings = useQuery(api.bookings.getPendingBookings, { token }) as BookingWithDetails[] | undefined;
  const cancelBooking = useMutation(api.bookings.cancelBooking);
  const approveBooking = useMutation(api.bookings.approveBooking);
  const rejectBooking = useMutation(api.bookings.rejectBooking);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);

  const handleCancel = async (id: Id<"bookings">) => {
    if (!window.confirm(t('cancel_confirm'))) return;
    try {
      await cancelBooking({ token, bookingId: id });
      toast.success(t('cancel_success'));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('cancel_error'));
    }
  };

  const handleApprove = async (id: Id<"bookings">) => {
    if (!window.confirm(t('approve_confirm'))) return;
    try {
      await approveBooking({ token, bookingId: id });
      toast.success(t('approve_success'));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('approve_error'));
    }
  };

  const handleReject = async (id: Id<"bookings">) => {
    const reason = window.prompt(t('reject_prompt'));
    if (reason === null) return;
    if (reason.trim() === "") return toast.error(t('reject_reason_required'));

    try {
      await rejectBooking({ token, bookingId: id, reason });
      toast.success(t('reject_success'));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('reject_error'));
    }
  };

  const openSaleModal = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setIsSaleModalOpen(true);
  };

  const filteredBookings = useMemo(() => {
    return bookings?.filter(b => b.status === activeTab) || [];
  }, [bookings, activeTab]);

  if (bookings === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-slate-950 p-8 font-sans text-right transition-colors duration-300" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('page_title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold italic">{t('page_subtitle')}</p>
      </div>

      {/* نظام التبويبات الجديد للتقسيم */}
      <div className="flex gap-4 mb-8 bg-white dark:bg-slate-900 w-fit p-1.5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <Timer size={16} /> {t('tab_pending')} ({bookings?.filter(b => b.status === 'pending').length || 0})
        </button>
        <button 
          onClick={() => setActiveTab('confirmed')}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'confirmed' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          <CheckCircle size={16} /> {t('tab_confirmed')} ({bookings?.filter(b => b.status === 'confirmed').length || 0})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredBookings.length > 0 ? filteredBookings.map((booking: BookingWithDetails) => (
          <div 
            key={booking._id} 
            className={`bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md dark:hover:shadow-slate-950/40 transition-all ${
              booking.status === 'confirmed' ? 'border-indigo-100 dark:border-indigo-900/30 border-r-8 border-r-indigo-500' : 'border-slate-100 dark:border-white/5'
            }`}
          >
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Car size={32} />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">{booking.carDetails?.make} {booking.carDetails?.model}</h3>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">{t('listed_price').replace('{price}', booking.carDetails?.price?.toLocaleString() || '')}</p>
              </div>
              {booking.inspectionDate && (
                <div className="mr-4 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-900/30">
                  <p className="text-[10px] font-black uppercase">{t('inspection_scheduled')}</p>
                  <p className="text-xs font-bold">{new Date(booking.inspectionDate).toLocaleDateString('ar-DZ')}</p>
                </div>
              )}
            </div>

            {/* قسم هوية الزبون - الاسم والإيميل فقط بطلبكِ */}
            <div className="flex items-center gap-4 w-full md:w-auto px-8 md:border-r border-slate-50 dark:border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black shadow-inner uppercase">
                {booking.clientDetails?.fullName?.[0] || booking.guestName?.[0] || <User size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-slate-800 dark:text-slate-200 text-sm">
                    {booking.clientDetails?.fullName || booking.guestName || t('guest')}
                  </p>
                  {booking.userId && (
                    <span title={t('registered_member')}>
                      <CheckCircle2 size={14} className="text-blue-500" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Mail size={12} className="text-slate-300 dark:text-slate-600" />
                  {booking.clientDetails?.email || t('guest_booking')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">
                  <Calendar size={14} />
                  <span>{t('booking_date').replace('{date}', new Date(booking.createdAt).toLocaleDateString('ar-DZ'))}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                  <Clock size={14} />
                  <span>{new Date(booking.createdAt).toLocaleTimeString('ar-DZ')}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {activeTab === 'pending' && (
                  <button 
                    onClick={() => handleApprove(booking._id)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 dark:shadow-none"
                  >
                    <CheckCircle2 size={16} /> {t('btn_approve')}
                  </button>
                )}
                <button 
                  onClick={() => openSaleModal(booking)}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                  <DollarSign size={16} /> {t('btn_complete_sale')}
                </button>
                <button 
                  onClick={() => handleReject(booking._id)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-6 py-3 rounded-xl font-black text-xs hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all flex items-center gap-2"
                >
                  <Ban size={16} /> {t('btn_reject')}
                </button>
                <button 
                  onClick={() => handleCancel(booking._id)}
                  className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-450 px-6 py-3 rounded-xl font-black text-xs hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <XCircle size={16} /> {t('btn_cancel')}
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
            <ListFilter size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
            <p className="text-slate-400 dark:text-slate-500 font-bold italic">{t('no_bookings')}</p>
          </div>
        )}
      </div>

      <SaleFormModal 
        isOpen={isSaleModalOpen} 
        key={selectedBooking?._id || 'new-sale'} // Add key to force remount and reset state
        onClose={() => setIsSaleModalOpen(false)} 
        initialData={selectedBooking || undefined}
      />
    </div>
  );
};

export default BookingsPage;