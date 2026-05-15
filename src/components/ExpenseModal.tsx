import React, { useState } from 'react';
import { X, Receipt, DollarSign, Tag, Loader2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExpenseModal = ({ isOpen, onClose }: ExpenseModalProps) => {
  const token = localStorage.getItem("convex_token") || "";
  const addExpense = useMutation(api.expenses.addExpense);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Other' as "Rent" | "Utilities" | "Salaries" | "Marketing" | "Maintenance" | "Other",
    amount: '',
    date: new Date().toISOString().split('T')[0],
    carId: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addExpense({
        token,
        title: formData.title,
        category: formData.category,
        amount: Number(formData.amount),
        date: new Date(formData.date).getTime(),
        carId: formData.carId ? (formData.carId as Id<"cars">) : undefined // Corrected type
      });
      onClose();
      setFormData({ title: '', category: 'Other', amount: '', date: new Date().toISOString().split('T')[0], carId: '' });
    } catch (error) {
      console.error("Failed to add expense:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
              <Receipt size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">إضافة مصروف جديد</h2>
              <p className="text-xs font-bold text-slate-500">تسجيل التكاليف التشغيلية للمعرض</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6" dir="rtl">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">بيان المصروف</label>
            <div className="relative">
              <Tag className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                type="text"
                placeholder="مثلاً: فاتورة الكهرباء، كراء المحل..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pr-12 pl-4 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الفئة</label>
              <select
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof formData.category })}
              >
                <option value="Rent">كراء</option>
                <option value="Utilities">فواتير</option>
                <option value="Salaries">رواتب</option>
                <option value="Marketing">تسويق</option>
                <option value="Maintenance">صيانة</option>
                <option value="Other">أخرى</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">المبلغ (دج)</label>
              <div className="relative">
                <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  required
                  type="number"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 pr-12 pl-4 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">التاريخ</label>
            <input
              required
              type="date"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "حفظ المصروف"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;