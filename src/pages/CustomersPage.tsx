import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  Search, Phone, CreditCard, Trash2, Edit3, Loader2, DollarSign, 
  MapPin, Users, Mail, Calendar, Shield, 
  UserMinus, CheckCircle, X, Save, Plus, BadgeAlert, AlertCircle, 
  Briefcase, CheckCircle2, UserPlus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Doc, Id } from '../../convex/_generated/dataModel';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/customers/ar.json';
import en from '../lib/i18n/pages/customers/en.json';
import fr from '../lib/i18n/pages/customers/fr.json';

interface StatCard {
  name: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
  border: string;
  pulse?: boolean;
}

const CustomersPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'customers' | 'users'>('customers');

  // Modal States
  const [editingCustomer, setEditingCustomer] = useState<Doc<"customers"> | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for adding customer
  const [newCustomerData, setNewCustomerData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    identityNum: '',
    status: 'خالص',
    totalPurchases: 0
  });
  const { t } = usePageTranslation({ ar, en, fr });

  // Queries
  const currentUser = useQuery(api.users.viewer, { token });
  const isAdmin = currentUser?.role === "admin";

  const customers = useQuery(
    api.customers.listCustomers, 
    { token, searchTerm: activeTab === 'customers' ? searchTerm : "" }
  ) as Doc<"customers">[] | undefined;

  const users = useQuery(
    api.users.listUsers, 
    isAdmin ? { token } : "skip"
  ) as Doc<"users">[] | undefined;

  // Mutations
  const removeCustomer = useMutation(api.customers.deleteCustomer);
  const updateCustomer = useMutation(api.customers.updateCustomer);
  const createCustomer = useMutation(api.customers.createCustomer);
  const approveUser = useMutation(api.users.approveUser);
  const updateRole = useMutation(api.users.updateUserRole);
  const removeUser = useMutation(api.users.deleteUser);

  // Filter users locally based on search term
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (activeTab !== 'users' || !searchTerm) return users;
    const lower = searchTerm.toLowerCase();
    return users.filter(user => 
      user.fullName.toLowerCase().includes(lower) || 
      user.email.toLowerCase().includes(lower) || 
      (user.phone && user.phone.includes(lower))
    );
  }, [users, searchTerm, activeTab]);

  // Statistics Computations
  const customerStats = useMemo<StatCard[]>(() => {
    if (!customers) return [];
    const total = customers.length;
    const paid = customers.filter(c => c.status === "خالص").length;
    const debt = customers.filter(c => c.status === "دين").length;
    const totalPurchasesSum = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);

    return [
      { name: t('stats_total_customers'), value: total, icon: <Users className="text-violet-600 dark:text-violet-400" />, bg: 'bg-violet-50 dark:bg-violet-950/40', border: 'border-violet-100 dark:border-violet-900/50', pulse: false },
      { name: t('stats_paid'), value: paid, icon: <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-100 dark:border-emerald-900/50', pulse: false },
      { name: t('stats_debt'), value: debt, icon: <AlertCircle className="text-rose-600 dark:text-rose-400" />, bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-100 dark:border-rose-900/50', pulse: false },
      { name: t('stats_purchase_volume'), value: `${totalPurchasesSum.toLocaleString()} دج`, icon: <DollarSign className="text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-100 dark:border-amber-900/50', pulse: false },
    ];
  }, [customers]);

  const userStats = useMemo<StatCard[]>(() => {
    if (!users) return [];
    const total = users.length;
    const adminsCount = users.filter(u => u.role === 'admin').length;
    const salesCount = users.filter(u => u.role === 'sales_manager').length;
    const pending = users.filter(u => u.status === 'pending').length;

    return [
      { name: t('stats_total_users'), value: total, icon: <Users className="text-indigo-600 dark:text-indigo-400" />, bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-100 dark:border-indigo-900/50', pulse: false },
      { name: t('stats_admins'), value: adminsCount, icon: <Shield className="text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-100 dark:border-amber-900/50', pulse: false },
      { name: t('stats_sales_team'), value: salesCount, icon: <Briefcase className="text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-100 dark:border-emerald-900/50', pulse: false },
      { name: t('stats_pending_reqs'), value: pending, icon: <BadgeAlert className="text-rose-600 dark:text-rose-400" />, bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-100 dark:border-rose-900/50', pulse: pending > 0 },
    ];
  }, [users]);

  const pendingUsersCount = useMemo(() => {
    return users?.filter(u => u.status === 'pending').length || 0;
  }, [users]);

  // Handlers for Customers
  const handleDeleteCustomer = async (id: Id<"customers">, name: string) => {
    if (!window.confirm(t('delete_customer_confirm').replace('{name}', name))) return;
    try {
      await removeCustomer({ token, customerId: id });
      toast.success(t('delete_customer_success'));
    } catch {
      toast.error(t('delete_customer_error'));
    }
  };

  const handleEditCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    
    setIsSubmitting(true);
    try {
      await updateCustomer({
        token,
        customerId: editingCustomer._id,
        fullName: editingCustomer.fullName,
        phone: editingCustomer.phone,
        email: editingCustomer.email || undefined,
        address: editingCustomer.address || undefined,
        identityNum: editingCustomer.identityNum || undefined,
        status: editingCustomer.status,
        totalPurchases: editingCustomer.totalPurchases
      });
      toast.success(t('edit_customer_success'));
      setEditingCustomer(null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('edit_customer_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerData.fullName.trim() || !newCustomerData.phone.trim()) {
      return toast.error(t('form_required_fields'));
    }

    setIsSubmitting(true);
    try {
      await createCustomer({
        token,
        fullName: newCustomerData.fullName,
        phone: newCustomerData.phone,
        email: newCustomerData.email || undefined,
        address: newCustomerData.address || undefined,
        identityNum: newCustomerData.identityNum || undefined,
        status: newCustomerData.status,
        totalPurchases: newCustomerData.totalPurchases
      });
      toast.success(t('add_customer_success'));
      setIsAddModalOpen(false);
      setNewCustomerData({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        identityNum: '',
        status: 'خالص',
        totalPurchases: 0
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('add_customer_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Users
  const handleApproveUser = async (userId: Id<"users">, name: string) => {
    try {
      await approveUser({ token, userId });
      toast.success(t('approve_user_success').replace('{name}', name));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('approve_user_error'));
    }
  };

  const handleRoleChange = async (userId: Id<"users">, newRole: "admin" | "sales_manager" | "viewer") => {
    try {
      await updateRole({ token, userId, role: newRole });
      toast.success(t('update_role_success'));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('update_role_error'));
    }
  };

  const handleDeleteUser = async (userId: Id<"users">, name: string) => {
    if (!window.confirm(t('delete_user_account_confirm').replace('{name}', name))) return;
    try {
      await removeUser({ token, userId });
      toast.success(t('delete_account_success'));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('delete_user_error'));
    }
  };

  const isDataLoading = activeTab === 'customers' 
    ? customers === undefined 
    : users === undefined;

  if (isDataLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD] dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-600 dark:text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#F8F9FD] dark:bg-slate-950 font-sans text-right transition-colors duration-300" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {activeTab === 'customers' ? t('page_title_customers') : t('page_title_users')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-sm md:text-base">
            {activeTab === 'customers' 
              ? t('page_desc_customers')
              : t('page_desc_users')}
          </p>
        </div>

        {/* زر إضافة زبون يدوي */}
        {activeTab === 'customers' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <UserPlus size={16} />
            <span>{t('add_customer')}</span>
          </button>
        )}
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {(activeTab === 'customers' ? customerStats : userStats).map((s, i) => (
          <div 
            key={i} 
            className={`bg-white dark:bg-slate-900 p-5 md:p-6 rounded-[2rem] border ${s.border} shadow-sm flex items-center gap-5 transition-all hover:shadow-md ${
              s.pulse ? 'ring-2 ring-rose-500/50 animate-pulse' : ''
            }`}
          >
            <div className={`${s.bg} p-4 rounded-2xl`}>{s.icon}</div>
            <div>
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.name}</p>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* عناصر التبديل بين الزبائن والمستخدمين */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        
        {/* التبويب */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit gap-1 shadow-inner border border-slate-200/40 dark:border-slate-700/50">
          <button
            onClick={() => { setActiveTab('customers'); setSearchTerm(""); }}
            className={`relative px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t('tab_customers')}
          </button>
          {isAdmin && (
            <button
              onClick={() => { setActiveTab('users'); setSearchTerm(""); }}
              className={`relative px-5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>{t('tab_users')}</span>
              {pendingUsersCount > 0 && (
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>
          )}
        </div>

        {/* شريط البحث */}
        <div className="relative w-full sm:w-80 lg:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder={activeTab === 'customers' ? t('search_placeholder_customers') : t('search_placeholder_users')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all"
/>
        </div>
      </div>

      {/* جداول البيانات - بدون card box */}
      {activeTab === 'customers' ? (
        /* جدول الزبائن */
            <table className="w-full text-right min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-4">{t('th_customer')}</th>
                  <th className="px-8 py-4">{t('th_contact')}</th>
                  <th className="px-8 py-4">{t('th_identity')}</th>
                  <th className="px-8 py-4">{t('th_purchases')}</th>
                  <th className="px-8 py-4">{t('th_status')}</th>
                  <th className="px-8 py-4 text-center">{t('th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {customers && customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-black">
                            {customer.fullName[0]}
                          </div>
                          <span className="font-black text-slate-800 dark:text-slate-200">{customer.fullName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                            <Phone size={14} className="text-slate-300 dark:text-slate-600" /> {customer.phone}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-bold">
                            <MapPin size={12} className="text-slate-300 dark:text-slate-600" /> {customer.address || t('not_specified')}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300">
                          <CreditCard size={14} className="text-indigo-400 dark:text-indigo-500/70" /> {customer.identityNum || "---"}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300">
                          <DollarSign size={14} className="text-emerald-500 dark:text-emerald-400" /> 
                          {customer.totalPurchases?.toLocaleString()} 
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-1">دج</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black ${
                          customer.status === "خالص" 
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            : customer.status === "دين" 
                              ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400"
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingCustomer(customer)}
                            className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition-all cursor-pointer"
                            title={t('title_edit')}
                          >
                            <Edit3 size={16}/>
                          </button>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDeleteCustomer(customer._id, customer.fullName)}
                              className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white transition-all cursor-pointer"
                              title="حذف الزبون"
                            >
                              <Trash2 size={16}/>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-slate-400 dark:text-slate-500 font-bold">{t('no_customers')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* جدول قبول وإدارة المستخدمين (الأدمن فقط) */
            <table className="w-full text-right min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-4">{t('th_user')}</th>
                  <th className="px-8 py-4">{t('th_email')}</th>
                  <th className="px-8 py-4">{t('th_role')}</th>
                  <th className="px-8 py-4">{t('th_account_status')}</th>
                  <th className="px-8 py-4">{t('th_last_login')}</th>
                  <th className="px-8 py-4 text-center">{t('th_actions_users')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: Doc<"users">) => (
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
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-bold">
                            <Mail size={14} className="text-slate-300 dark:text-slate-600" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold">
                              <Phone size={12} className="text-slate-300 dark:text-slate-600" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <select 
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value as "admin" | "sales_manager" | "viewer")}
                          className={`
                            text-[10px] font-black px-3 py-1.5 rounded-lg border-0 ring-1 ring-inset outline-none cursor-pointer transition-all dark:bg-slate-900
                            ${user.role === 'admin' 
                              ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-900/50' 
                              : user.role === 'sales_manager' 
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-900/50' 
                                : 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700/50'}
                          `}
                        >
                          <option value="viewer">{t('role_viewer')}</option>
                          <option value="sales_manager">{t('role_sales')}</option>
                          <option value="admin">{t('role_admin')}</option>
                        </select>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 w-fit ${
                          user.status === 'active' 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : user.status === 'pending' 
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse' 
                              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active' ? 'bg-emerald-500' : user.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {user.status === 'active' ? t('status_active') : user.status === 'pending' ? t('status_pending_activation') : t('status_banned')}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold">
                          <Calendar size={14} className="text-slate-300 dark:text-slate-600" />
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-DZ') : t('not_login_yet')}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {user.status === 'pending' && (
                            <button 
                              onClick={() => handleApproveUser(user._id, user.fullName)}
                              className="px-3 py-1.5 text-xs font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-sm hover:shadow active:scale-95"
                              title={t('activate_account_title')}
                            >
                              <CheckCircle size={14} />
                              <span>{t('btn_activate')}</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(user._id, user.fullName)}
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer md:opacity-0 group-hover:opacity-100"
                            title={t('delete_user_title')}
                          >
                            <UserMinus size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-slate-400 dark:text-slate-500 font-bold">
                      {t('no_results')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

      {/* Modals using AnimatePresence & Framer Motion */}
      <AnimatePresence>
        
        {/* مودال تعديل بيانات الزبون */}
        {editingCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* الخلفية المظلمة */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCustomer(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* محتوى المودال */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative z-10 p-6 md:p-8"
            >
              
              {/* زر الإغلاق */}
              <button 
                onClick={() => setEditingCustomer(null)}
                className="absolute left-6 top-6 p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="text-indigo-600 dark:text-indigo-400" size={24} />
                  <span>{t('edit_customer_title')}</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">{t('edit_customer_desc')}</p>
              </div>

              <form onSubmit={handleEditCustomerSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* الاسم الكامل */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_name_label')}</label>
                    <input 
                      required
                      type="text" 
                      value={editingCustomer.fullName}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* رقم الهاتف */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_phone_label')}</label>
                    <input 
                      required
                      type="text" 
                      value={editingCustomer.phone}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* البريد الإلكتروني */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_email_label')}</label>
                    <input 
                      type="email" 
                      value={editingCustomer.email || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* رقم الهوية الوطنية */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_identity_label')}</label>
                    <input 
                      type="text" 
                      value={editingCustomer.identityNum || ''}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, identityNum: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* العنوان */}
                <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_address_label')}</label>
                  <input 
                    type="text" 
                    value={editingCustomer.address || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* إجمالي المشتريات */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_purchases_label')}</label>
                    <input 
                      type="number" 
                      value={editingCustomer.totalPurchases || 0}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, totalPurchases: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* الحالة المادية */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_status_label')}</label>
                    <select
                      value={editingCustomer.status}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="خالص">{t('status_paid_desc')}</option>
                      <option value="دين">{t('status_debt_desc')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    {t('btn_cancel')}
                  </button>
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-all cursor-pointer shadow shadow-indigo-200 dark:shadow-none hover:scale-[1.01] active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    <span>{t('btn_save')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* مودال إضافة زبون جديد */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* الخلفية المظلمة */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            {/* محتوى المودال */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative z-10 p-6 md:p-8"
            >
              
              {/* زر الإغلاق */}
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute left-6 top-6 p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="text-indigo-600 dark:text-indigo-400" size={24} />
                  <span>{t('add_customer_title')}</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">{t('add_customer_desc')}</p>
              </div>

              <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* الاسم الكامل */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_name_label')}</label>
                    <input 
                      required
                      type="text" 
                      placeholder="محمد بن علي"
                      value={newCustomerData.fullName}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* رقم الهاتف */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_phone_label')}</label>
                    <input 
                      required
                      type="text" 
                      placeholder="0661234567"
                      value={newCustomerData.phone}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* البريد الإلكتروني */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_email_label')}</label>
                    <input 
                      type="email" 
                      placeholder="customer@example.com"
                      value={newCustomerData.email}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* رقم الهوية الوطنية */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_identity_label')}</label>
                    <input 
                      type="text" 
                      placeholder="123456789012"
                      value={newCustomerData.identityNum}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, identityNum: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* العنوان */}
                <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_address_label')}</label>
                  <input 
                    type="text" 
                    placeholder="حي 5 جويلية، الجزائر العاصمة"
                    value={newCustomerData.address}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* إجمالي المشتريات */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_purchases_label')}</label>
                    <input 
                      type="number" 
                      value={newCustomerData.totalPurchases}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, totalPurchases: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* الحالة المادية */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 dark:text-slate-500 mb-2">{t('form_status_label')}</label>
                    <select
                      value={newCustomerData.status}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/55 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="خالص">{t('status_paid_desc')}</option>
                      <option value="دين">{t('status_debt_desc')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    {t('btn_cancel')}
                  </button>
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-all cursor-pointer shadow shadow-indigo-200 dark:shadow-none hover:scale-[1.01] active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    <span>{t('btn_add')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomersPage;