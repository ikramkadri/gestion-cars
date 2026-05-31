import { useState, useMemo } from 'react';
import { Archive, Search, Car, Loader2, RotateCcw, Package, DollarSign, Clock } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'react-hot-toast';
import { Id } from '../../convex/_generated/dataModel';
import StatsCard from '../components/StatsCard';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/archived-inventory/ar.json';
import en from '../lib/i18n/pages/archived-inventory/en.json';
import fr from '../lib/i18n/pages/archived-inventory/fr.json';

const ArchivedInventoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const cars = useQuery(api.cars.getCars, { includeArchived: true });
  const updateCar = useMutation(api.cars.updateCar);
  const { t } = usePageTranslation({ ar, en, fr });

  const filteredCars = cars?.filter(car => 
    car.make.toLowerCase().includes(searchQuery.toLowerCase()) || 
    car.model.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // A2: Stats row
  const stats = useMemo(() => {
    const data = filteredCars;
    const totalValue = data.reduce((acc, car) => acc + car.price, 0);
    const oldest = data.length > 0 
      ? data.reduce((oldest, car) => car._creationTime < oldest._creationTime ? car : oldest)
      : null;
    return [
      { label: t('total_archived') || 'Total Archived', value: data.length, icon: Package, bg: 'bg-slate-600', color: 'text-white' },
      { label: t('total_value') || 'Total Value', value: `${totalValue.toLocaleString()}`, icon: DollarSign, bg: 'bg-indigo-600', color: 'text-white' },
      { label: t('oldest_archive') || 'Oldest', value: oldest ? new Date(oldest._creationTime).toLocaleDateString('ar-DZ') : '-', icon: Clock, bg: 'bg-amber-500', color: 'text-white' },
    ];
  }, [filteredCars]);

  const handleRestore = async (id: Id<"cars">) => {
    const token = localStorage.getItem("convex_token") || "";
    try {
      await updateCar({
        token,
        carId: id,
        updates: { isArchived: false, status: "Available" }
      });
      toast.success(t('restore_success'));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('restore_error'));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans text-right transition-colors duration-300" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
          <Archive className="text-muted-foreground" size={32} /> {t('page_title')}
        </h1>
        <p className="text-muted-foreground font-bold italic">{t('page_subtitle')}</p>
      </div>

      {/* A2: Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((s, i) => (
          <StatsCard key={i} label={s.label} val={s.value} unit="" icon={s.icon} bg={s.bg} color={s.color} />
        ))}
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input 
          type="text" 
          placeholder={t('search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-12 pl-4 py-3 bg-card border-border text-foreground rounded-2xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-slate-400 transition-all"
        />
      </div>

      {cars === undefined ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : filteredCars.length > 0 ? (
        <div className="bg-card rounded-[2.5rem] shadow-sm border-border overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">{t('th_vehicle')}</th>
                <th className="px-8 py-4 text-right">{t('th_price')}</th>
                <th className="px-8 py-4 text-right">{t('th_status')}</th>
                <th className="px-8 py-4 text-center">{t('th_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCars.map((car) => (
                <tr key={car._id} className="hover:bg-muted/30 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded-lg bg-muted overflow-hidden">
                        <img src={car.mainImageUrl || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=150"} className="w-full h-full object-cover" alt="" />
                      </div>
                      <span className="font-black text-card-foreground">{car.make} {car.model}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-card-foreground tabular-nums text-right">
                    {car.price.toLocaleString()} <span className="text-[10px] text-muted-foreground">دج</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black border ${
                      car.status === "Sold" 
                        ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30' 
                        : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      {car.status === "Sold" ? t('status_sold') : t('status_archived')}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleRestore(car._id)}
                        aria-label={t('restore_title') || 'Restore car'}
                        className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all shadow-sm cursor-pointer"
                        title={t('restore_title')}
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
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-[3rem] border-2 border-dashed border-border">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground/30">
            <Car size={40} />
          </div>
          <h2 className="text-xl font-black text-muted-foreground">{t('empty_title')}</h2>
          <p className="text-muted-foreground/60 font-bold mt-2 text-sm text-center max-w-xs">
            {t('empty_desc')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ArchivedInventoryPage;
