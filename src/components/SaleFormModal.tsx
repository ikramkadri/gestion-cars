import { useState, useEffect } from 'react'; // Added useEffect
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Doc } from '../../convex/_generated/dataModel'; // Import Doc
import { X, User, Phone, DollarSign, CreditCard, Car, Loader2, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CarType } from '../features/cars/types/car.types'; // Import CarType

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BookingWithDetails | null; // Added initialData prop
}

interface ClientDetails { // Moved from BookingsPage.tsx to be accessible here
  _id: Id<"users">;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  identityNum?: string;
}

interface BookingWithDetails extends Doc<"bookings"> { // Moved from BookingsPage.tsx
  carId: Id<"cars">; // Explicitly add carId as it's used directly
  carDetails: CarType;
  clientDetails: ClientDetails;
  status: "pending" | "confirmed" | "cancelled" | "rejected";
  rejectionReason?: string;
}

const SaleFormModal = ({ isOpen, onClose, initialData }: SaleFormModalProps) => {
  const token = localStorage.getItem("convex_token") || "";
  
  // جلب السيارات (المتاحة والمحجوزة) القابلة للبيع
  const allCars = useQuery(api.cars.getCars, { includeArchived: false });
  const createSale = useMutation(api.sales.createSale);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    carId: '',
    customerName: '',
    phone: '',
    address: '',
    identityNum: '',
    amountPaid: 0,
    paymentMethod: 'Cash' as "Cash" | "Bank Transfer" | "Check" | "Card",
  });

  // تصفية السيارات لعرض المتاحة والمحجوزة فقط، أو السيارة المحددة في الحجز
  const displayCars = allCars?.filter(car => 
    car.status === "Available" || 
    car.status === "Reserved" || 
    (initialData && car._id === initialData.carId)
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        carId: initialData.carId as string, // Cast to string for input value
        customerName: initialData.clientDetails?.fullName || '',
        phone: initialData.clientDetails?.phone || '', // في حال وجوده في جدول المستخدمين
        amountPaid: initialData.carDetails?.price || 0,
        address: initialData.clientDetails?.address || '',
        identityNum: initialData.clientDetails?.identityNum || '',
        paymentMethod: 'Cash',
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.carId) return toast.error("يرجى اختيار سيارة");

    setIsSubmitting(true);
    try {
      await createSale({
        ...formData,
        carId: formData.carId as Id<"cars">, // Cast to Id<"cars">
        address: formData.address || undefined,
        identityNum: formData.identityNum || undefined,
        bookingId: initialData?._id, // إرسال المعرف لفك الالتباس في السيرفر
        token,
      });
      toast.success("تمت عملية البيع وإصدار الفاتورة بنجاح");
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء تسجيل البيع";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCar = allCars?.find((c) => c._id === formData.carId);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
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

        <form onSubmit={handleSubmit} className="p-8 space-y-6" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* اختيار السيارة */}
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase mr-1 flex items-center gap-1">
                <Car size={14} /> اختر المركبة المباعة
              </label>
              <select 
                required
                value={formData.carId}
                onChange={(e) => setFormData({...formData, carId: e.target.value as Id<"cars">})}
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
              >
                <option value="">-- اختر من المخزون المتاح --</option>
                {displayCars?.map((car) => (
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

            {/* بيانات الزبون */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase mr-1 flex items-center gap-1">
                <User size={14} /> اسم الزبون الكامل
              </label>
              <input 
                type="text"
                required
                placeholder="ياسين..."
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                placeholder="الولاية، الدائرة، الحي..."
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            {/* البيانات المالية */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase mr-1 flex items-center gap-1">
                <DollarSign size={14} /> مبلغ البيع المتفق عليه
              </label>
              <input 
                type="number"
                required
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-indigo-600"
                value={formData.amountPaid || ''}
                onChange={(e) => setFormData({...formData, amountPaid: Number(e.target.value)})}
              />
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

          <button 
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg mt-4 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <DollarSign size={20} />}
            إتمام الصفقة وإصدار الفاتورة
          </button>
        </form>
      </div>
    </div>
  );
};

export default SaleFormModal;
