import { useState } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Phone, MessageSquare, Loader2, CheckCircle2, User, Lock, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: Id<"cars">;
  carName: string;
}

const BookingModal = ({ isOpen, onClose, carId, carName }: BookingModalProps) => {
  const [step, setStep] = useState<'auth' | 'info' | 'success'>(
    localStorage.getItem("convex_token") ? 'info' : 'auth'
  );
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Mutations
  const authenticate = useAction(api.auth.authenticate);
  const storeUser = useMutation(api.users.storeUser);
  const reserveCar = useMutation(api.bookings.reserveCar);

  // Form States
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });
  const [bookingData, setBookingData] = useState({
    customerPhone: '',
    customerLocation: '',
    inspectionDate: '',
    message: ''
  });

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await authenticate({
        email: authData.email,
        name: isLogin ? "User" : authData.name,
        password: authData.password
      });

      localStorage.setItem("convex_token", result.token);
      await storeUser({ token: result.token }); // تهيئة بيانات المستخدم في النظام
      
      toast.success(isLogin ? "مرحباً بك مجدداً!" : "تم إنشاء حسابك بنجاح!");
      setStep('info'); // الانتقال التلقائي لنافذة المعلومات
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "فشل التحقق من البيانات";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("convex_token") || "";
      await reserveCar({
        carId,
        token,
        customerPhone: bookingData.customerPhone,
        customerLocation: bookingData.customerLocation,
        inspectionDate: bookingData.inspectionDate ? new Date(bookingData.inspectionDate).getTime() : undefined,
        message: bookingData.message,
        bookingSource: "website"
      });
      setStep('success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء الحجز";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative"
        dir="rtl"
      >
        <button onClick={onClose} className="absolute top-6 left-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-20">
          <X size={20} className="text-slate-400" />
        </button>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* خطوة التسجيل / الدخول */}
            {step === 'auth' && (
              <motion.div 
                key="auth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">سجل أولاً للمتابعة</h3>
                  <p className="text-slate-500 font-bold">لحجز {carName}، يجب أن تملك حساباً لتوثيق موعدك.</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="relative">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required type="text" placeholder="الاسم الكامل"
                        className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                        value={authData.name} onChange={(e) => setAuthData({...authData, name: e.target.value})}
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required type="email" placeholder="البريد الإلكتروني"
                      className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                      value={authData.email} onChange={(e) => setAuthData({...authData, email: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required type="password" placeholder="كلمة المرور"
                      className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                      value={authData.password} onChange={(e) => setAuthData({...authData, password: e.target.value})}
                    />
                  </div>
                  <button 
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : isLogin ? "تسجيل الدخول" : "إنشاء حساب مجاني"}
                  </button>
                </form>

                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="w-full text-center text-sm font-black text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {isLogin ? "ليس لديك حساب؟ سجل الآن" : "تملك حساباً بالفعل؟ سجل دخولك"}
                </button>
              </motion.div>
            )}

            {/* خطوة إدخال معلومات الحجز */}
            {step === 'info' && (
              <motion.div 
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">تأكيد تفاصيل الحجز</h3>
                  <p className="text-emerald-600 font-bold">رائع! أنت مسجل الآن. أكمل بيانات الموعد.</p>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required type="tel" placeholder="رقم الهاتف النشط"
                      className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white"
                      value={bookingData.customerPhone} onChange={(e) => setBookingData({...bookingData, customerPhone: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required type="text" placeholder="الولاية / العنوان"
                      className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white"
                      value={bookingData.customerLocation} onChange={(e) => setBookingData({...bookingData, customerLocation: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date"
                      className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white"
                      value={bookingData.inspectionDate} onChange={(e) => setBookingData({...bookingData, inspectionDate: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <MessageSquare className="absolute right-4 top-4 text-slate-400" size={18} />
                    <textarea 
                      placeholder="رسالة إضافية (اختياري)..."
                      className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all h-24 resize-none text-slate-900 dark:text-white"
                      value={bookingData.message} onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                    />
                  </div>
                  <button 
                    disabled={isLoading}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "إرسال طلب الحجز الآن"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* خطوة النجاح */}
            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-10 space-y-6"
              >
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900">تم استلام طلبك!</h3>
                  <p className="text-slate-500 font-bold leading-relaxed">
                    شكراً لك. فريقنا سيقوم بمراجعة الحجز والاتصال بك لتأكيد الموعد.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all"
                >
                  فهمت، شكراً
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;