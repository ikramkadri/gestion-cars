import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  Users, UserCheck, ShieldAlert, Search, 
  Mail, Calendar, Shield, UserMinus, Loader2, CheckCircle
} from 'lucide-react'; // Removed unused imports
import { toast } from 'react-hot-toast';
import { Id, Doc } from '../../convex/_generated/dataModel';

const UsersPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  const [searchTerm, setSearchTerm] = useState("");

  // جلب قائمة المستخدمين من Convex (للأدمن فقط حسب القواعد التي وضعناها)
  const users = useQuery(api.users.listUsers, { token }) as Doc<"users">[] | undefined;
  const updateRole = useMutation(api.users.updateUserRole);
  const removeUser = useMutation(api.users.deleteUser);
  const approveUser = useMutation(api.users.approveUser);

  // تصفية المستخدمين بناءً على البحث
  const filteredUsers = useMemo(() => {
    return users?.filter(user => 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [users, searchTerm]);

  const stats = useMemo(() => {
    if (!users) return [];
    return [
      { name: 'إجمالي المستخدمين', value: users?.length || 0, icon: <Users className="text-indigo-600" />, bg: 'bg-indigo-50' },
      { name: 'المسؤولين (Admins)', value: users?.filter(u => u.role === 'admin').length || 0, icon: <Shield className="text-amber-600" />, bg: 'bg-amber-50' },
      { name: 'فريق المبيعات', value: users?.filter(u => u.role === 'sales_manager').length || 0, icon: <UserCheck className="text-emerald-600" />, bg: 'bg-emerald-50' },
      { name: 'المشاهدين', value: users?.filter(u => u.role === 'viewer').length || 0, icon: <ShieldAlert className="text-slate-600" />, bg: 'bg-slate-50' },
    ];
  }, [users]);

  // تغيير رتبة المستخدم فورياً
  const handleRoleChange = async (userId: Id<"users">, newRole: "admin" | "sales_manager" | "viewer") => {
    try {
      await updateRole({ token, userId, role: newRole });
      toast.success("تم تحديث رتبة المستخدم بنجاح");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء التحديث.");
    }
  };

  // حذف مستخدم مع تأكيد
  const handleDeleteUser = async (userId: Id<"users">, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return;

    // Handle loading state for users
    if (users === undefined || users === null) {
      return (
        <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      );
    }
    try {
      await removeUser({ token, userId });
      toast.success("تم حذف المستخدم بنجاح");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء الحذف");
    }
  };

  if (users === undefined) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-slate-950 p-8 font-sans transition-colors duration-300" dir="rtl">
      {/* العنوان */}
      <div className="mb-10 text-right">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">إدارة فريق العمل</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold italic">تحكم في صلاحيات المستخدمين والوصول للنظام</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-5 transition-all hover:shadow-md dark:hover:shadow-slate-950/40">
            <div className={`${s.bg} dark:bg-slate-800/60 p-4 rounded-2xl`}>{s.icon}</div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.name}</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* شريط البحث */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            className="w-full pr-12 pl-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-850 dark:text-white rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* جدول المستخدمين */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">المستخدم</th>
                <th className="px-8 py-4">البريد الإلكتروني</th>
                <th className="px-8 py-4">الرتبة / الصلاحية</th>
                <th className="px-8 py-4">حالة الدخول</th>
                <th className="px-8 py-4">آخر دخول</th>
                <th className="px-8 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
              {filteredUsers.length > 0 ? filteredUsers.map((user: Doc<"users">) => (
                <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                        <img 
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} 
                          alt={user.fullName} 
                        />
                      </div>
                      <span className="font-black text-slate-800 dark:text-slate-200 text-sm">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold">
                      <Mail size={14} className="text-slate-300 dark:text-slate-650" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value as "admin" | "sales_manager" | "viewer")}
                      className={`
                        text-[10px] font-black px-3 py-1.5 rounded-lg border-0 ring-1 ring-inset outline-none cursor-pointer transition-all
                        ${user.role === 'admin' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-900/30' : 
                          user.role === 'sales_manager' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-900/30' : 
                          'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-slate-200 dark:ring-slate-700'}
                      `}
                    >
                      <option value="viewer">مشاهد (Viewer)</option>
                      <option value="sales_manager">مدير مبيعات (Sales)</option>
                      <option value="admin">مدير نظام (Admin)</option>
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                      user.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 
                      user.status === 'pending' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 animate-pulse' : 
                      'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455'
                    }`}>
                      {user.status === 'active' ? 'نشط' : user.status === 'pending' ? 'قيد الانتظار' : 'محظور'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold">
                      <Calendar size={14} className="text-slate-300 dark:text-slate-650" />
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-DZ') : 'لم يدخل بعد'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {user.status === 'pending' && (
                        <button 
                          onClick={() => approveUser({ token, userId: user._id })}
                          className="p-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer rounded-xl"
                          title="تفعيل الحساب"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteUser(user._id, user.fullName)}
                        className="p-2 text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="حذف المستخدم"
                      >
                        <UserMinus size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-slate-400 dark:text-slate-650 font-bold">
                    لا توجد نتائج تطابق بحثك..
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;