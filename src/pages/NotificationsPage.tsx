import { useState, useMemo } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, BadgeCheck, Trash2, Loader2, Car, Settings, ShieldAlert, ExternalLink } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Doc, Id } from '../../convex/_generated/dataModel';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/notifications/ar.json';
import en from '../lib/i18n/pages/notifications/en.json';
import fr from '../lib/i18n/pages/notifications/fr.json';

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const token = localStorage.getItem("convex_token") || "";
  const navigate = useNavigate();
  
  // تمرير filter إلى الـ Convex query
  const notifications = useQuery(api.notifications.getAllNotifications, { token });
  const markAllRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotif = useMutation(api.notifications.deleteNotification);
  const markRead = useMutation(api.notifications.markAsRead);
  
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    if (filter === 'all') return notifications;
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
  const { t } = usePageTranslation({ ar, en, fr });

  const handleMarkAllRead = async () => {
    try {
      await markAllRead({ token });
      toast.success(t('mark_all_read_success'));
    } catch {
      toast.error(t('mark_all_read_error'));
    }
  };

  const handleNotificationClick = async (notif: Doc<"notifications">) => {
    // تحديد كمقروء إذا لم يكن كذلك
    if (!notif.isRead) {
      await markRead({ token, notificationId: notif._id });
    }
    
    // الانتقال للرابط إذا وجد
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: Id<"notifications">) => {
    e.stopPropagation();
    try {
      await deleteNotif({ token, notificationId: id });
      toast.success(t('delete_success'));
    } catch {
      toast.error(t('delete_error'));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reservation': return <Car className="text-blue-600" />;
      case 'system': return <Settings className="text-slate-600" />;
      case 'success': return <BadgeCheck className="text-emerald-500" />;
      case 'warning': return <AlertTriangle className="text-amber-500" />;
      case 'error': return <ShieldAlert className="text-rose-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  if (notifications === undefined) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD] dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFC] dark:bg-slate-950 p-4 md:p-10 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <Bell size={14} /> {t('new_notifications').replace('{count}', String(unreadCount))}
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {t('page_title')} <span className="text-indigo-600 dark:text-indigo-400">{t('page_title_highlight')}</span>
            </h1>
            <p className="text-slate-400 dark:text-slate-500 font-bold mt-2 text-sm">
              {t('page_desc')}
            </p>
          </div>
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
          >
            <CheckCheck size={18} /> {t('mark_all_read')}
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { label: t('filter_all'), value: 'all' },
            { label: t('filter_bookings'), value: 'reservation' },
            { label: t('filter_updates'), value: 'system' },
            { label: t('filter_success'), value: 'success' },
            { label: t('filter_warnings'), value: 'warning' },
          ].map((f) => (
            <button 
              key={f.value} 
              onClick={() => setFilter(f.value)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${filter === f.value ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl shadow-slate-200 dark:shadow-none scale-105' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div 
              key={notif._id} 
              onClick={() => handleNotificationClick(notif)}
              className={`group relative bg-white dark:bg-slate-900 p-5 rounded-[2rem] border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer 
                ${!notif.isRead ? 'border-indigo-500/20 dark:border-indigo-500/30 bg-gradient-to-l from-indigo-50/30 dark:from-indigo-950/20 to-white dark:to-slate-900' : 'border-slate-100 dark:border-slate-800'}
                ${notif.priority === 'high' ? 'ring-2 ring-rose-500/10 dark:ring-rose-500/20' : ''}`}
            >
              <div className="flex gap-4 items-center">
                <div className={`p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:scale-110 transition-all shadow-sm ${notif.priority === 'high' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50' : ''}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`font-black text-[15px] ${!notif.isRead ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                      {notif.title}
                      {notif.priority === 'high' && <span className="mr-2 text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">{t('priority_high')}</span>}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                      {new Date(notif.createdAt).toLocaleDateString('ar-DZ')} - {new Date(notif.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{notif.message}</p>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {notif.actionUrl && (
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <ExternalLink size={14} />
                    </div>
                  )}
                  <button onClick={(e) => handleDelete(e, notif._id)} className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;