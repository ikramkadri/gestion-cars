import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Search, Phone, CreditCard, Trash2, Edit3, Loader2, DollarSign, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Doc, Id } from '../../convex/_generated/dataModel';

const CustomersPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  const [searchTerm, setSearchTerm] = useState("");

  const customers = useQuery(api.customers.listCustomers, { token, searchTerm }) as Doc<"customers">[] | undefined;
  const removeCustomer = useMutation(api.customers.deleteCustomer);

  const handleDelete = async (id: Id<"customers">, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الزبون "${name}"؟`)) return;
    try {
      await removeCustomer({ token, customerId: id });
      toast.success("تم حذف الزبون بنجاح");
    } catch {
      toast.error("فشل الحذف، للأدمن فقط هذه الصلاحية");
    }
  };

  if (customers === undefined) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans text-right" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900">إدارة الزبائن</h1>
          <p className="text-slate-500 font-bold italic">قاعدة بيانات العملاء المسجلين في Motorix</p>
        </div>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="ابحث بالاسم، الهاتف أو رقم الهوية..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-12 pl-4 py-3 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-8 py-4">الزبون</th>
              <th className="px-8 py-4">معلومات الاتصال</th>
              <th className="px-8 py-4">رقم التعريف</th>
              <th className="px-8 py-4">إجمالي المشتريات</th>
              <th className="px-8 py-4">الحالة</th>
              <th className="px-8 py-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50"> {/* customer is implicitly typed as Doc<"customers"> */}
            {customers.map((customer) => (
              <tr key={customer._id} className="hover:bg-slate-50 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black">
                      {customer.fullName[0]}
                    </div>
                    <span className="font-black text-slate-800">{customer.fullName}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <Phone size={14} className="text-slate-300" /> {customer.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                      <MapPin size={12} className="text-slate-300" /> {customer.address || "غير محدد"}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                    <CreditCard size={14} className="text-indigo-400" /> {customer.identityNum || "---"}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                    <DollarSign size={14} className="text-emerald-500" /> 
                    {customer.totalPurchases?.toLocaleString()} 
                    <span className="text-[10px] text-slate-400 mr-1">دج</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                    customer.status === "خالص" ? "bg-emerald-50 text-emerald-600" : 
                    customer.status === "دين" ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                      <Edit3 size={16}/>
                    </button>
                    <button 
                      onClick={() => handleDelete(customer._id, customer.fullName)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-20 text-center text-slate-400 font-bold">لا يوجد زبائن حالياً..</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersPage;