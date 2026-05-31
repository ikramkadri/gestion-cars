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
import ConfirmDialog from '../components/ConfirmDialog';

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

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: 'destructive' | 'warning' | 'info';
    confirmLabel: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', variant: 'info', confirmLabel: '', onConfirm: () => {} });
  const showConfirm = (opts: { title: string; description: string; variant?: 'destructive' | 'warning' | 'info'; confirmLabel?: string; onConfirm: () => void }) =>
    setConfirmDialog({ open: true, ...opts, variant: opts.variant || 'info', confirmLabel: opts.confirmLabel || 'Confirm' });

  const handleCancel = async (id: Id<"bookings">) => {
    showConfirm({
      title: t('cancel_title'),
      description: t('cancel_confirm'),
      variant: 'destructive',
      confirmLabel: t('btn_cancel') || 'Cancel Booking',
      onConfirm: async () => {
        try {
          await cancelBooking({ token, bookingId: id });
          toast.success(t('cancel_success'));
        } catch (error: unknown) {
          toast.error(error instanceof Error ? error.message : t('cancel_error'));
        }
      },
    });
  };

  const handleApprove = async (id: Id<"bookings">) => {
    showConfirm({
      title: t('approve_title'),
      description: t('approve_confirm'),
      variant: 'info',
      confirmLabel: t('btn_approve') || 'Approve',
      onConfirm: async () => {
        try {
          await approveBooking({ token, bookingId: id });
          toast.success(t('approve_success'));
        } catch (error: unknown) {
          toast.error(error instanceof Error ? error.message : t('approve_error'));
        }
      },
    });
  };

  const handleReject = async (id: Id<"bookings">) => {
    showConfirm({
      title: t('reject_title'),
      description: t('reject_confirm'),
      variant: 'warning',
      confirmLabel: t('btn_reject') || 'Reject',
      onConfirm: () => {
        const reason = window.prompt(t('reject_prompt'));
        if (reason === null) return;
        if (reason.trim() === "") return toast.error(t('reject_reason_required'));
        (async () => {
          try {
            await rejectBooking({ token, bookingId: id, reason });
            toast.success(t('reject_success'));
          } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : t('reject_error'));
          }
        })();
      },
    });
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans text-right transition-colors duration-300" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('page_title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold italic">{t('page_subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-card w-fit p-1.5 rounded-2xl border border-border shadow-sm">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'pending' 
              ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-500/20' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Timer size={16} /> {t('tab_pending')} ({bookings?.filter(b => b.status === 'pending').length || 0})
        </button>
        <button 
          onClick={() => setActiveTab('confirmed')}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'confirmed' 
              ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/20' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckCircle size={16} /> {t('tab_confirmed')} ({bookings?.filter(b => b.status === 'confirmed').length || 0})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredBookings.length > 0 ? filteredBookings.map((booking: BookingWithDetails) => (
          <div 
            key={booking._id} 
            className={`bg-card rounded-[2rem] p-4 md:p-6 shadow-sm border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 hover:shadow-md transition-all ${
              booking.status === 'confirmed' ? 'border-indigo-100 dark:border-indigo-900/30 border-r-4 border-r-indigo-500' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Car size={28} />
              </div>
              <div>
                <h3 className="font-black text-base md:text-lg text-card-foreground">{booking.carDetails?.make} {booking.carDetails?.model}</h3>
                <p className="text-sm font-bold text-muted-foreground">{t('listed_price').replace('{price}', booking.carDetails?.price?.toLocaleString() || '')}</p>
              </div>
              {booking.inspectionDate && (
                <div className="mr-0 md:mr-4 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-900/30 shrink-0">
                  <p className="text-[10px] font-black uppercase">{t('inspection_scheduled')}</p>
                  <p className="text-xs font-bold">{new Date(booking.inspectionDate).toLocaleDateString('ar-DZ')}</p>
                </div>
              )}
            </div>

            {/* Customer identity */}
            <div className="flex items-center gap-4 w-full md:w-auto md:px-8 md:border-r border-border">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black shadow-inner uppercase shrink-0">
                {booking.clientDetails?.fullName?.[0] || booking.guestName?.[0] || <User size={18} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-black text-sm text-card-foreground">
                    {booking.clientDetails?.fullName || booking.guestName || t('guest')}
                  </p>
                  {booking.userId && (
                    <span title={t('registered_member')}>
                      <CheckCircle2 size={14} className="text-blue-500" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                  <Mail size={12} className="text-muted-foreground/50" />
                  {booking.clientDetails?.email || t('guest_booking')}
                </p>
              </div>
            </div>

            <div className="flex items-start md:items-center gap-4 w-full md:w-auto justify-between">
              <div className="text-right shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-1">
                  <Calendar size={14} />
                  <span>{new Date(booking.createdAt).toLocaleDateString('ar-DZ')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Clock size={14} />
                  <span>{new Date(booking.createdAt).toLocaleTimeString('ar-DZ')}</span>
                </div>
              </div>

              {/* Action buttons - responsive: 2x2 on mobile, row on desktop */}
              <div className="flex flex-row flex-wrap gap-2 justify-end">
                {activeTab === 'pending' && (
                  <button 
                    onClick={() => handleApprove(booking._id)}
                    className="bg-blue-600 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-black text-[11px] md:text-xs hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-lg shadow-blue-100 dark:shadow-none"
                  >
                    <CheckCircle2 size={14} /> {t('btn_approve')}
                  </button>
                )}
                <button 
                  onClick={() => openSaleModal(booking)}
                  className="bg-emerald-600 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-black text-[11px] md:text-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                  <DollarSign size={14} /> {t('btn_complete_sale')}
                </button>
                <button 
                  onClick={() => handleReject(booking._id)}
                  className="bg-muted text-muted-foreground px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-black text-[11px] md:text-xs hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all flex items-center gap-1.5"
                >
                  <Ban size={14} /> {t('btn_reject')}
                </button>
                <button 
                  onClick={() => handleCancel(booking._id)}
                  className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-black text-[11px] md:text-xs hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <XCircle size={14} /> {t('btn_cancel')}
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-card rounded-[2rem] p-16 text-center border-2 border-dashed border-border">
            <ListFilter size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-bold italic">{t('no_bookings')}</p>
            <p className="text-muted-foreground/60 text-xs font-bold mt-2">
              {activeTab === 'pending' ? t('no_pending_hint') : t('no_confirmed_hint')}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.onConfirm}
      />

      <SaleFormModal 
        isOpen={isSaleModalOpen} 
        key={selectedBooking?._id || 'new-sale'}
        onClose={() => setIsSaleModalOpen(false)} 
        initialData={selectedBooking || undefined}
      />
    </div>
  );
};

export default BookingsPage;
