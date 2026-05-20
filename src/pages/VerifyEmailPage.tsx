import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'react-hot-toast';
import { Loader2, ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const verifyEmail = useMutation(api.auth.verifyEmail);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('رابط التأكيد غير صالح أو مفقود.');
        return;
      }

      try {
        const result = await verifyEmail({ token });
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
          toast.success("تم التوثيق بنجاح! 🎉");
        } // error is implicitly typed as unknown
      } catch (error: unknown) {
        setStatus('error'); // error is implicitly typed as unknown
        setMessage(error instanceof Error ? error.message : 'حدث خطأ أثناء محاولة توثيق الحساب.');
      }
    };

    handleVerification();
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl text-center"
      >
        {status === 'loading' && (
          <div className="space-y-6">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto" />
            <h2 className="text-2xl font-black text-slate-900">جاري توثيق حسابك...</h2>
            <p className="text-slate-500 font-bold">يرجى الانتظار لحظة بينما نتحقق من بياناتك.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">تم التوثيق!</h2>
            <p className="text-slate-500 font-bold leading-relaxed">{message}</p>
            <button onClick={() => navigate('/admin')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              دخول للوحة التحكم <ArrowLeft size={20} />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">فشل التوثيق</h2>
            <p className="text-rose-500 font-bold">{message}</p>
            <button onClick={() => navigate('/login')} className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">العودة لتسجيل الدخول</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;