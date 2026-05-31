import { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  Users, UserCheck, ShieldAlert, Search, 
  Mail, Calendar, Shield, UserMinus, Loader2, CheckCircle, Timer, Ban,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Id, Doc } from '../../convex/_generated/dataModel';
import StatsCard from '../components/StatsCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/users/ar.json';
import en from '../lib/i18n/pages/users/en.json';
import fr from '../lib/i18n/pages/users/fr.json';

const PAGE_SIZE = 20;

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-900/30',
  sales_manager: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-900/30',
  viewer: 'bg-muted text-muted-foreground ring-border',
};

const UsersPage = () => {
  const token = localStorage.getItem("convex_token") || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = usePageTranslation({ ar, en, fr });

  const users = useQuery(api.users.listUsers, { token }) as Doc<"users">[] | undefined;
  const updateRole = useMutation(api.users.updateUserRole);
  const removeUser = useMutation(api.users.deleteUser);
  const approveUser = useMutation(api.users.approveUser);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: 'destructive' | 'warning' | 'info';
    confirmLabel: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', variant: 'info', confirmLabel: '', onConfirm: () => {} });
  const showConfirm = (opts: { title: string; description: string; variant?: 'destructive' | 'warning' | 'info'; confirmLabel?: string; onConfirm: () => void }) =>
    setConfirmDialog({ open: true, ...opts, variant: opts.variant || 'info', confirmLabel: opts.confirmLabel || 'Confirm' });

  // Filter users
  const filteredUsers = useMemo(() => {
    return users?.filter(user => 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [users, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  // Reset to page 1 on search
  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const stats = useMemo(() => {
    if (!users) return [];
    return [
      { name: t('stats_total'), value: users.length, icon: Users, bg: 'bg-indigo-600', color: 'text-white' },
      { name: t('stats_admins'), value: users.filter(u => u.role === 'admin').length, icon: Shield, bg: 'bg-amber-500', color: 'text-white' },
      { name: t('stats_sales'), value: users.filter(u => u.role === 'sales_manager').length, icon: UserCheck, bg: 'bg-emerald-500', color: 'text-white' },
      { name: t('stats_viewers'), value: users.filter(u => u.role === 'viewer').length, icon: ShieldAlert, bg: 'bg-slate-600', color: 'text-white' },
    ];
  }, [users]);

  // Role change with confirmation
  const handleRoleChange = (userId: Id<"users">, newRole: "admin" | "sales_manager" | "viewer", currentRole: string, userName: string) => {
    showConfirm({
      title: t('role_confirm_title'),
      description: t('role_confirm_desc').replace('{name}', userName).replace('{old}', currentRole).replace('{new}', newRole),
      variant: 'warning',
      confirmLabel: t('role_confirm_btn') || 'Change Role',
      onConfirm: async () => {
        try {
          await updateRole({ token, userId, role: newRole });
          toast.success(t('role_update_success'));
        } catch (error: unknown) {
          toast.error(error instanceof Error ? error.message : t('role_update_error'));
        }
      },
    });
  };

  // Delete with confirmation
  const handleDeleteUser = (userId: Id<"users">, name: string) => {
    showConfirm({
      title: t('delete_title'),
      description: t('delete_confirm').replace('{name}', name),
      variant: 'destructive',
      confirmLabel: t('delete_button') || 'Delete',
      onConfirm: async () => {
        try {
          await removeUser({ token, userId });
          toast.success(t('delete_success'));
        } catch (error: unknown) {
          toast.error(error instanceof Error ? error.message : t('delete_error'));
        }
      },
    });
  };

  if (users === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans transition-colors duration-300" dir="rtl">
      {/* Header */}
      <div className="mb-10 text-right">
        <h1 className="text-3xl font-black text-foreground">{t('page_title')}</h1>
        <p className="text-muted-foreground font-bold italic">{t('page_subtitle')}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((s, i) => (
          <StatsCard key={i} label={s.name} val={s.value} unit="" icon={s.icon} bg={s.bg} color={s.color} />
        ))}
      </div>

      {/* Search bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            className="w-full pr-12 pl-4 py-3 bg-card border-border text-foreground rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        {totalPages > 1 && (
          <div className="text-xs font-bold text-muted-foreground">
            {t('page_info')?.replace('{current}', String(currentPage)).replace('{total}', String(totalPages)) || `Page ${currentPage} of ${totalPages}`}
          </div>
        )}
      </div>

      {/* Users table */}
      <div className="bg-card rounded-[2.5rem] shadow-sm border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">{t('th_user')}</th>
                <th className="px-8 py-4">{t('th_email')}</th>
                <th className="px-8 py-4">{t('th_role')}</th>
                <th className="px-8 py-4">{t('th_status')}</th>
                <th className="px-8 py-4">{t('th_last_login')}</th>
                <th className="px-8 py-4 text-center">{t('th_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedUsers.length > 0 ? paginatedUsers.map((user: Doc<"users">) => (
                <tr key={user._id} className="hover:bg-muted/30 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black overflow-hidden border-2 border-card shadow-sm">
                        <img 
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} 
                          alt={user.fullName} 
                        />
                      </div>
                      <span className="font-black text-card-foreground text-sm">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold">
                      <Mail size={14} className="text-muted-foreground/50" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value as "admin" | "sales_manager" | "viewer", user.role, user.fullName)}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-lg border-0 ring-1 ring-inset outline-none cursor-pointer transition-all ${ROLE_COLORS[user.role] || ROLE_COLORS.viewer}`}
                    >
                      <option value="viewer">{t('role_viewer')}</option>
                      <option value="sales_manager">{t('role_sales')}</option>
                      <option value="admin">{t('role_admin')}</option>
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
                      user.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
                      user.status === 'pending' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' :
                      'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                    }`}>
                      {user.status === 'active' ? <><CheckCircle size={12} /> {t('status_active')}</> : 
                       user.status === 'pending' ? <><Timer size={12} /> {t('status_pending')}</> : 
                       <><Ban size={12} /> {t('status_banned')}</>}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                      <Calendar size={14} className="text-muted-foreground/50" />
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-DZ') : t('not_login')}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {user.status === 'pending' && (
                        <button 
                          onClick={() => approveUser({ token, userId: user._id })}
                          aria-label={t('activate_user') || 'Activate user'}
                          className="p-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer rounded-xl"
                          title={t('activate_title')}
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteUser(user._id, user.fullName)}
                        aria-label={t('delete_user') || 'Delete user'}
                        className="p-2 min-w-[36px] min-h-[36px] text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-rose-50 dark:hover:bg-red-950/20 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
                        title={t('delete_user') || 'Delete user'}
                      >
                        <UserMinus size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-muted-foreground font-bold">
                    {t('no_results')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination (U5) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-2.5 rounded-xl bg-card border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label={t('prev_page') || 'Previous page'}
          >
            <ChevronRight size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                page === currentPage
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-2.5 rounded-xl bg-card border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label={t('next_page') || 'Next page'}
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
};

export default UsersPage;
