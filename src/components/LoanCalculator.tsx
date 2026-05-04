import React, { useState } from 'react';
import { Calculator, X, Calendar, Landmark } from 'lucide-react';

interface LoanCalculatorProps {
  price: number;
  onClose: () => void;
}

const LoanCalculator: React.FC<LoanCalculatorProps> = ({ price, onClose }) => {
  const [downPayment, setDownPayment] = useState(price * 0.3);
  const [years, setYears] = useState(5);
  const [interestRate] = useState(7); 

  // حساب القسط الشهري مباشرة أثناء الرندرة (Derived State)
  // هذا يغنيك عن استخدام useEffect و useState للقسط
  const principal = price - downPayment;
  const monthlyRate = (interestRate / 100) / 12;
  const numberOfPayments = years * 12;
  
  let monthlyPayment = 0;
  if (monthlyRate > 0) {
    const x = Math.pow(1 + monthlyRate, numberOfPayments);
    monthlyPayment = (principal * x * monthlyRate) / (x - 1);
  } else {
    monthlyPayment = principal / numberOfPayments;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" dir="rtl">
        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Calculator className="animate-bounce" />
            <h3 className="font-black text-xl">حاسبة التقسيط البنكي</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase flex justify-between">
              <span><Landmark size={14} className="inline ml-1"/> الدفعة الأولى</span>
              <span className="text-blue-600">{Math.round((downPayment/price)*100)}%</span>
            </label>
            <input 
              type="range" min={price * 0.1} max={price * 0.8} step={100000} value={downPayment} 
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-lg font-black text-slate-800 dark:text-white">{downPayment.toLocaleString()} دج</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
              <Calendar size={14}/> مدة القرض
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 7].map((y) => (
                <button 
                  key={y} onClick={() => setYears(y)}
                  className={`py-2 rounded-xl font-bold transition-all ${years === y ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                  {y} سنوات
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] border-2 border-blue-100 dark:border-blue-900/30 text-center">
            <span className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">القسط الشهري التقريبي</span>
            <div className="flex items-baseline justify-center gap-2 mt-1">
              <span className="text-4xl font-black text-slate-900 dark:text-white">{Math.round(monthlyPayment).toLocaleString()}</span>
              <span className="text-blue-600 font-bold text-sm">دج/شهر</span>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-xl">
            موافق
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;