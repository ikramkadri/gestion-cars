import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  Receipt, Plus, Search, 
  Filter, Download
} from 'lucide-react';
import ExpenseModal from '../components/ExpenseModal';
import LoadingScreen from '../components/LoadingScreen';

const ExpensesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem("convex_token") || "";
  
  // جلب المصاريف من Convex
  const expenses = useQuery(api.expenses.getExpenses, { token });

  if (expenses === undefined) return <LoadingScreen />;

  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

  return (
    <div className="p-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">إدارة المصاريف</h1>
          <p className="text-slate-500 font-bold mt-1">تتبع التكاليف التشغيلية ومصاريف المعرض</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
        >
          <Plus size={20} />
          إضافة مصروف
        </button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-500/10 text-rose-600 rounded-2xl">
              <Receipt size={24} />
            </div>
            <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-lg">إجمالي المصاريف</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{totalExpenses.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-400">دج</span>
          </div>
        </div>
      </div>

      {/* جدول البيانات */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-white/5 flex flex-wrap gap-4 justify-between items-center text-right">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="البحث في المصاريف..."
              className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl py-3 pr-12 pl-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-right"
            />
          </div>
          <div className="flex gap-2">
             <button className="p-3 bg-slate-50 dark:bg-white/5 text-slate-500 rounded-xl hover:bg-slate-100 transition-all">
                <Filter size={18} />
             </button>
             <button className="p-3 bg-slate-50 dark:bg-white/5 text-slate-500 rounded-xl hover:bg-slate-100 transition-all">
                <Download size={18} />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5">
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">البيان</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">الفئة</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">المبلغ</th>
                <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {expenses?.map((expense: any) => (
                <tr key={expense._id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-6 text-sm font-black text-slate-900 dark:text-white">{expense.title}</td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase">{expense.category}</span>
                  </td>
                  <td className="p-6 font-black text-slate-900 dark:text-white">{expense.amount.toLocaleString()} دج</td>
                  <td className="p-6 text-slate-500 text-xs font-bold">{new Date(expense.date).toLocaleDateString('ar-DZ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ExpensesPage;