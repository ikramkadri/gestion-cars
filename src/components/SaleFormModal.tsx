import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id, Doc } from '../../convex/_generated/dataModel';
import { X, User, Phone, DollarSign, CreditCard, Car, Loader2, MapPin, Hash, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BookingWithDetails } from '../types/app'; // استخدام النوع من الملف الموحد

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BookingWithDetails | null;
  preSelectedCarId?: Id<"cars"> | null; // جعل هذا اختياريًا
  setShowConfetti?: (show: boolean) => void; // جعل هذا اختياريًا
}

// تعريف نوع الحالة الخاصة بالنموذج
interface SaleFormData {
  carId: string;
  customerName: string;
  phone: string;
  address: string;
  identityNum: string;
  amountPaid: number;
  vin: string;
  paymentMethod: "Cash" | "Bank Transfer" | "Check" | "Card";
}

const SaleFormModal = ({ isOpen, onClose, initialData, preSelectedCarId, setShowConfetti }: SaleFormModalProps) => {
  const token = localStorage.getItem("convex_token") || "";
  
  // تحسين الأداء: جلب فقط السيارات القابلة للبيع بدلاً من المخزون كاملاً
  const allCars = useQuery(api.cars.getSellableCars, { token });
  const createSale = useMutation(api.sales.createSale);
  
  // محاولة جلب بيانات الحجز إذا كانت السيارة مختارة ومحجوزة
  const activeBooking = useQuery(api.bookings.getActiveBookingForCar, preSelectedCarId ? { carId: preSelectedCarId } : "skip");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializedRef = useRef<Id<"cars"> | null>(null); // لتتبع ما إذا كانت بيانات السيارة المحددة مسبقاً قد تم تهيئتها

  const [formData, setFormData] = useState<SaleFormData>(() => {
    if (initialData) {
      return {
        carId: initialData.carId,
        customerName: initialData.clientDetails?.fullName || initialData.guestName || '',
        phone: initialData.customerPhone || initialData.clientDetails?.phone || '',
        address: initialData.customerLocation || initialData.clientDetails?.address || '',
        identityNum: '', // Assuming this is not in initialData
        amountPaid: initialData.carDetails?.price || 0,
        vin: initialData.carDetails?.vin || '',
        paymentMethod: 'Cash',
      };
    } else if (preSelectedCarId) {
      // For preSelectedCarId, we can initialize with the carId.
      // Other details (customerName, phone, address, amountPaid, vin) will be filled by a subsequent useEffect
      // once `allCars` and `activeBooking` are loaded.
      return {
        carId: preSelectedCarId,
        customerName: '', phone: '', address: '', identityNum: '', amountPaid: 0, vin: '', paymentMethod: 'Cash',
      };
    } else {
      // Manual entry, start with empty form
      return {
        carId: '', customerName: '', phone: '', address: '', identityNum: '', amountPaid: 0, vin: '', paymentMethod: 'Cash',
      };
    }
  });

  // تصفية السيارات لعرض المتاحة والمحجوزة فقط، أو السيارة المحددة في الحجز
  const displayCars = allCars?.filter((car: Doc<"cars">) => 
    (car.status === "Available" || car.status === "Reserved") && 
    (!initialData || car._id === initialData.carId || car.status === "Available")
  );

  useEffect(() => {
    // إذا أغلقت النافذة، نعيد تصفير المرجع للتمكن من إعادة التهيئة عند الفتح القادم
    if (!isOpen) {
      initializedRef.current = null;
      return;
    }

    // الانتظار حتى استلام البيانات بالكامل وتجنب التحديثات المتتالية (Cascading Renders)
    const isDataLoaded = allCars !== undefined && (preSelectedCarId ? activeBooking !== undefined : true);

    if (isDataLoaded && preSelectedCarId && initializedRef.current !== preSelectedCarId) {
      const car = allCars?.find((c: Doc<"cars">) => c._id === preSelectedCarId);
      if (car) {
        // استخدام setTimeout لتأجيل التحديث للدورة التالية (Next Tick) 
        // لضمان عدم حدوث Cascading Renders وإرضاء الـ Linter
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            carId: preSelectedCarId as string,
            customerName: activeBooking?.clientDetails?.fullName || activeBooking?.guestName || prev.customerName,
            phone: activeBooking?.customerPhone || activeBooking?.clientDetails?.phone || prev.phone,
            address: activeBooking?.customerLocation || activeBooking?.clientDetails?.address || prev.address,
            amountPaid: car.price || prev.amountPaid,
            vin: car.vin || prev.vin || '',
          }));
        }, 0);
        initializedRef.current = preSelectedCarId;
      }
    }
  }, [isOpen, preSelectedCarId, allCars, activeBooking]);

  const handleCarSelection = (carId: Id<"cars">) => {
    const car = allCars?.find((c: Doc<"cars">) => c._id === carId);
    setFormData(prev => ({
      ...prev,
      carId,
      amountPaid: car?.price || prev.amountPaid,
      vin: car?.vin || ''
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. منع إرسال البيانات إذا كانت ناقصة (التحقق الصارم)
    if (!formData.carId) return toast.error("خطأ: يرجى اختيار سيارة أولاً.");
    if (!formData.customerName.trim()) return toast.error("يرجى إدخال اسم الزبون الكامل.");
    if (!formData.phone.trim()) return toast.error("رقم هاتف الزبون إلزامي.");
    if (!formData.identityNum.trim()) return toast.error("رقم الهوية (NIN) مطلوب قانونياً.");
    if (!formData.address.trim()) return toast.error("عنوان السكن مطلوب لإصدار الفاتورة.");

    // 2. التحقق من دفع كامل المبلغ
    const car = allCars?.find(c => c._id === formData.carId);
    if (car && formData.amountPaid < car.price) {
      return toast.error("لا يمكن إتمام البيع: المبلغ المدفوع أقل من سعر السيارة.");
    }

    setIsSubmitting(true);
    try {
      const saleId = await createSale({
        ...formData,
        carId: formData.carId as Id<"cars">, // Cast to Id<"cars">
        bookingId: initialData?._id, // إرسال المعرف لفك الالتباس في السيرفر
        token,
      });

      console.log("Sale created with ID:", saleId); // سجل لتأكيد معرف عملية البيع
      // ميزة الطباعة التلقائية: فتح الفاتورة في نافذة جديدة مهيأة للطباعة فوراً
      if (saleId) {
        const printUrl = `/admin/invoice/${saleId}?print=true`;
        window.open(printUrl, '_blank');
      }

      setShowConfetti?.(true); // تفعيل الاحتفال في الخلفية (مع التحقق من وجود الدالة)
      toast.success("مبارك! تمت عملية البيع وإصدار الفاتورة بنجاح 🎉", { duration: 5000 });

      // إغلاق النافذة فوراً وتنسيق انتهاء الاحتفال بعد 4 ثوانٍ
      onClose();
      setTimeout(() => { setShowConfetti?.(false); }, 4000);

    } catch (error: unknown) {
      console.error("Error creating sale:", error); // سجل لأي أخطاء تحدث
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء تسجيل البيع";
      toast.error(errorMessage);
    }
  };

  const selectedCar = allCars?.find((c: Doc<"cars">) => c._id === (formData.carId as Id<"cars">));
  const remainingAmount = selectedCar ? Math.max(0, selectedCar.price - formData.amountPaid) : 0;
  const paymentPercentage = selectedCar ? Math.min(100, (formData.amountPaid / selectedCar.price) * 100) : 0;

  const getAutoFilledClass = (val: string | number | null | undefined) => val ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100" : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[95vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-900 p-6 text-white flex justify-between items-center border-b-4 border-[#D4AF37] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign size={20} />
            </div>
            <h3 className="text-xl font-black">تسجيل عملية بيع جديدة</h3>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            
            {/* اختيار السيارة */}
            <div className="col-span-2 space-y-2 bg-blue-50/50 p-4 rounded-3xl border border-blue-100">
              <label className="text-xs font-black text-slate-400 uppercase mr-1 flex items-center gap-1">
                <Car size={14} /> {(initialData || preSelectedCarId) ? "المركبة المحددة (مقيدة)" : "اختر المركبة المباعة"}
              </label>
              <select 
                required
                disabled={!!initialData || !!preSelectedCarId}
                value={formData.carId}
                onChange={(e) => handleCarSelection(e.target.value as Id<"cars">)}
                className={`w-full p-4 rounded-2xl font-black text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none text-indigo-900 shadow-sm ${
                  (initialData || preSelectedCarId) ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-80' : 'bg-white border-slate-200'
                }`}
              >
                <option value="">-- اختر من المخزون المتاح --</option>
                {displayCars?.map((car: Doc<"cars">) => (
                  <option key={car._id} value={car._id}>
                    {car.make} {car.model} ({car.year}) - {car.price.toLocaleString()} دج
                  </option>
                ))}
              </select>
              {selectedCar && (
                <p className="text-[10px] font-black text-indigo-500 mt-1 mr-2 italic">
                  السعر المطلوب: {selectedCar.price.toLocaleString()} دج
                </p>
              )}
            </div>

            {/* رقم الهيكل (VIN) - إدخال وتأكيد */}
            <div className="space-y-2">
              <label className="text-xs font-black text-blue-600 uppercase mr-1 flex items-center gap-1">
                <Hash size={14} /> الرقم التسلسلي للمركبة (VIN) *
              </label>
              <input 
                type="text"
                required
                placeholder="إجباري لإتمام الفاتورة..."
                className={`w-full p-4 rounded-2xl font-mono text-base border-2 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${getAutoFilledClass(formData.vin)}`}
                value={formData.vin}
                onChange={(e) => setFormData({...formData, vin: e.target.value})}
              />
            </div>

            {/* بيانات الزبون */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase mr-1 flex items-center gap-1">
                <User size={14} /> اسم الزبون الكامل
              </label>
              <input 
                type="text"
                required
                placeholder="ياسين..."
                className={`w-full p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${getAutoFilledClass(formData.customerName)}`}
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase mr-1 flex items-center gap-1">
                <Phone size={14} /> رقم الهاتف
              </label>
              <input 
                type="tel"
                required
                placeholder="06..."
                className={`w-full p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${getAutoFilledClass(formData.phone)}`}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            {/* رقم الهوية الوطنية */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase mr-1 flex items-center gap-1">
                <CreditCard size={14} /> رقم الهوية الوطنية (NIN)
              </label>
              <input 
                type="text"
                required
                placeholder="123456789..."
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.identityNum}
                onChange={(e) => setFormData({...formData, identityNum: e.target.value})}
              />
            </div>

            {/* عنوان الإقامة */}
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase mr-1 flex items-center gap-1">
                <MapPin size={14} /> عنوان الإقامة
              </label>
              <input 
                type="text"
                required
                placeholder="الولاية، الدائرة، الحي..."
                className={`w-full p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${getAutoFilledClass(formData.address)}`}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            {/* قسم الخلاص المطور */}
            <div className="col-span-2 bg-slate-50 p-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                   <DollarSign size={16} className="text-[#D4AF37]" /> تفاصيل الدفعة المالية (الخلاص)
                </label>
                {selectedCar && (
                  <span className="text-[10px] font-bold text-slate-400 italic">سعر المركبة الأصلي: {selectedCar.price.toLocaleString()} دج</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative">
                  <input 
                    type="number"
                    required
                    className={`w-full border-2 p-4 rounded-2xl font-black text-2xl outline-none focus:border-blue-500 transition-all text-blue-700 shadow-sm ${initialData ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}
                    value={formData.amountPaid || ''}
                    onChange={(e) => setFormData({...formData, amountPaid: Number(e.target.value)})}
                    placeholder="أدخل المبلغ المدفوع..."
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">دج</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black uppercase">
                    <span className={remainingAmount === 0 ? "text-emerald-600" : "text-amber-600"}>
                      {remainingAmount === 0 ? "تم السداد بالكامل ✅" : `المتبقي: ${remainingAmount.toLocaleString()} دج`}
                    </span>
                    <span className="text-slate-400">{Math.round(paymentPercentage)}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner border border-white">
                    <div 
                      className={`h-full transition-all duration-1000 ${paymentPercentage === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse'}`}
                      style={{ width: `${paymentPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase mr-1 flex items-center gap-1">
                <CreditCard size={14} /> وسيلة الدفع
              </label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as typeof formData.paymentMethod})} // Typed paymentMethod
              >
                <option value="Cash">نقداً (Cash)</option>
                <option value="Bank Transfer">تحويل بنكي</option>
                <option value="Check">شيك مصدق</option>
                <option value="Card">بطاقة بنكية</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 bg-white text-slate-500 py-4 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all border border-slate-200"
          >
            إلغاء
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-[2] py-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 ${
              remainingAmount === 0 
              ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-green-100' 
              : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-100'
            }`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
            {remainingAmount === 0 ? "إتمام البيع النهائي 🎉" : "تسجيل عربون/دفع جزئي ⚠️"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleFormModal;
