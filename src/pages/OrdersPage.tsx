import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ShoppingBag, Clock, CheckCircle2, FileText, Car, ArrowLeftRight, Heart } from 'lucide-react';
import { SaleWithDetails } from '../types/app';
import InvoiceClassic from '../components/InvoiceClassic';
import DeliveryTrackerModal from '../components/DeliveryTrackerModal';
import CarCard from '../components/CarCard';
import { CarType } from '../features/cars/types/car.types';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/orders/ar.json';
import en from '../lib/i18n/pages/orders/en.json';
import fr from '../lib/i18n/pages/orders/fr.json';

const OrdersPage = () => {
  const token = localStorage.getItem("convex_token") ?? undefined;
  const [activeTab, setActiveTab] = useState<'orders' | 'favorites'>('orders');
  
  const bookings = useQuery(api.bookings.getMyBookings, token ? { token } : "skip");
  const sales = useQuery(api.sales.getRecentSales, token ? { token } : "skip") as SaleWithDetails[] | undefined;
  const favorites = useQuery(api.favorites.getMyFavorites, token ? { token } : "skip");
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<SaleWithDetails | null>(null);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const { t } = usePageTranslation({ ar, en, fr });

  if (bookings === undefined || sales === undefined || favorites === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans text-right transition-colors duration-300" dir="rtl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
          <ShoppingBag className="text-indigo-500" size={32} /> {t('page_title')}
        </h1>
        <p className="text-muted-foreground font-bold italic">{t('page_subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-card w-fit p-1.5 rounded-2xl border border-border shadow-sm">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {t('tab_orders')}
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'favorites' ? 'bg-rose-500 text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {t('tab_favorites')}
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
        
          {/* Active bookings */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-card-foreground flex items-center gap-2 mb-4">
              <Clock className="text-amber-500" size={20} /> {t('section_active_bookings')}
            </h2>
            {bookings.length > 0 ? bookings.map((booking) => (
              <div key={booking._id} className="bg-card p-6 rounded-[2rem] border-border shadow-sm flex items-center gap-4">
                <div className="w-16 h-12 bg-muted rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Car size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-card-foreground">{booking.carDetails?.make} {booking.carDetails?.model}</h3>
                  <p className="text-xs font-bold text-muted-foreground mt-1">
                    {t('booking_date').replace('{date}', new Date(booking.createdAt).toLocaleDateString('ar-DZ'))}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  booking.status === 'confirmed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
                  booking.status === 'pending' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                }`}>
                  {booking.status === 'confirmed' ? <><CheckCircle2 size={12} /> {t('status_confirmed')}</> : 
                   booking.status === 'pending' ? <><Clock size={12} /> {t('status_pending')}</> : 
                   <><ArrowLeftRight size={12} /> {t('status_rejected')}</>}
                </span>
              </div>
            )) : (
              <div className="bg-card p-10 rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                <ShoppingBag size={36} className="text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-bold italic">{t('no_active_bookings')}</p>
                <p className="text-muted-foreground/50 text-xs font-bold mt-1">
                  {t('no_active_bookings_desc') || 'Browse inventory to make a booking'}
                </p>
              </div>
            )}
          </div>

          {/* Purchased cars */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-card-foreground flex items-center gap-2 mb-4">
              <CheckCircle2 className="text-emerald-500" size={20} /> {t('section_purchased_cars')}
            </h2>
            {sales && sales.length > 0 ? sales.map((sale) => (
              <div key={sale._id} className="bg-slate-900 border border-slate-700 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
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
                      onClick={() => { setSelectedSale(sale); setIsInvoiceOpen(true); }}
                      className="flex items-center gap-2 text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <FileText size={14} /> {t('btn_download_invoice')}
                    </button>
                    <button 
                      onClick={() => { setSelectedDelivery(sale); setIsDeliveryOpen(true); }}
                      className="flex items-center gap-2 text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      <ArrowLeftRight size={14} /> {t('btn_track_delivery')}
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-card p-10 rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={36} className="text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-bold italic">{t('no_purchases_yet')}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Favorites */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {favorites && favorites.some(f => f !== null) ? (
            favorites.map((car) => car && (
              <CarCard key={car._id} car={car as unknown as CarType} showRemoveButton={true} />
            ))
          ) : (
            <div className="col-span-full py-24 bg-card rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
              <Heart className="text-rose-200 dark:text-rose-900/40 mb-4" size={48} />
              <h2 className="text-xl font-black text-muted-foreground">{t('favorites_empty')}</h2>
              <p className="text-muted-foreground/60 font-bold mt-2">{t('favorites_empty_desc')}</p>
            </div>
          )}
        </div>
      )}

      {/* Loyalty Journey */}
      <div className="mt-12 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
        <div className="text-center md:text-right">
          <h2 className="text-2xl font-black mb-2">{t('journey_title')}</h2>
          <p className="font-bold opacity-80 max-w-md">{t('journey_desc')}</p>
        </div>
        <div className="flex gap-4">
           <div className="flex flex-col items-center gap-2 opacity-50">
              <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-black">1</div>
              <span className="text-[10px] font-black">{t('step_discovery')}</span>
           </div>
           <div className="w-10 h-[2px] bg-white/20 mt-5" />
           <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-black">2</div>
              <span className="text-[10px] font-black">{t('step_ownership')}</span>
           </div>
        </div>
      </div>

      <InvoiceClassic isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} sale={selectedSale} />
      <DeliveryTrackerModal isOpen={isDeliveryOpen} onClose={() => setIsDeliveryOpen(false)} sale={selectedDelivery} />
    </div>
  );
};

export default OrdersPage;
