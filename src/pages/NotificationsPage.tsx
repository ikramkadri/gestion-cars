import { useState, useMemo } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, BadgeCheck, Trash2, Loader2, Car, Settings, ShieldAlert, ExternalLink, BellOff } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Doc, Id } from '../../convex/_generated/dataModel';
import { usePageTranslation } from '../lib/i18n/usePageTranslation';
import ar from '../lib/i18n/pages/notifications/ar.json';
import en from '../lib/i18n/pages/notifications/en.json';
import fr from '../lib/i18n/pages/notifications/fr.json';
import { useReducedMotion } from '../lib/useReducedMotion';

const FilterEmptyState = ({ icon: Icon, title, description }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center" role="status">
    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
      <Icon size={28} className="text-muted-foreground/50" />
    </div>
    <p className="text-sm font-black text-card-foreground mb-1">{title}</p>
    <p className="text-xs font-medium text-muted-foreground max-w-[240px]">{description}</p>
  </div>
);

const FILTER_EMPTY_MAP: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; titleKey: string; descKey: string }> = {
  all: { icon: BellOff, titleKey: 'empty_all_title', descKey: 'empty_all_desc' },
  reservation: { icon: Car, titleKey: 'empty_reservation_title', descKey: 'empty_reservation_desc' },
  system: { icon: Settings, titleKey: 'empty_system_title', descKey: 'empty_system_desc' },
  success: { icon: BadgeCheck, titleKey: 'empty_success_title', descKey: 'empty_success_desc' },
  warning: { icon: AlertTriangle, titleKey: 'empty_warning_title', descKey: 'empty_warning_desc' },
};

const LOAD_LIMIT = 20;

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const [displayLimit, setDisplayLimit] = useState(LOAD_LIMIT);
  const token = localStorage.getItem("convex_token") || "";
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  
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
  const displayedNotifications = useMemo(() => filteredNotifications.slice(0, displayLimit), [filteredNotifications, displayLimit]);
  const hasMore = filteredNotifications.length > displayLimit;
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
    if (!notif.isRead) {
      await markRead({ token, notificationId: notif._id });
    }
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

  const currentEmpty = FILTER_EMPTY_MAP[filter] || FILTER_EMPTY_MAP.all;

  if (notifications === undefined) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-10 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className={`inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${!reduced ? 'animate-pulse' : ''}`}>
              <Bell size={14} /> {t('new_notifications').replace('{count}', String(unreadCount))}
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter">
              {t('page_title')} <span className="text-indigo-600 dark:text-indigo-400">{t('page_title_highlight')}</span>
            </h1>
            <p className="text-muted-foreground font-bold mt-2 text-sm">
              {t('page_desc')}
            </p>
          </div>
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-card border-border rounded-xl text-sm font-bold text-card-foreground hover:bg-muted/50 transition-all"
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
              onClick={() => { setFilter(f.value); setDisplayLimit(LOAD_LIMIT); }}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${filter === f.value ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl shadow-slate-200 dark:shadow-none scale-105' : 'bg-card text-muted-foreground border-border hover:bg-muted/50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* N3: aria-live region */}
        <div className="space-y-3" role="list" aria-live="polite" aria-label={t('notifications_list') || 'Notifications'}>
          {displayedNotifications.length > 0 ? displayedNotifications.map((notif) => (
            <div 
              key={notif._id} 
              onClick={() => handleNotificationClick(notif)}
              role="listitem"
              className={`group relative bg-card p-5 rounded-[2rem] border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer 
                ${!notif.isRead ? 'border-indigo-500/20 dark:border-indigo-500/30 bg-gradient-to-l from-indigo-50/30 dark:from-indigo-950/20 to-card' : 'border-border'}
                ${notif.priority === 'high' ? 'ring-2 ring-rose-500/10 dark:ring-rose-500/20' : ''}`}
            >
              <div className="flex gap-4 items-center">
                <div className={`p-4 rounded-[1.5rem] bg-muted border-border group-hover:bg-card group-hover:scale-110 transition-all shadow-sm ${notif.priority === 'high' ? '!bg-rose-50 dark:!bg-rose-950/20 !border-rose-100 dark:!border-rose-900/50' : ''}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`font-black text-[15px] ${!notif.isRead ? 'text-indigo-900 dark:text-indigo-300' : 'text-card-foreground'}`}>
                      {notif.title}
                      {notif.priority === 'high' && <span className={`mr-2 text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded-full ${!reduced ? 'animate-pulse' : ''}`}>{t('priority_high')}</span>}
                    </h3>
                    <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                      {new Date(notif.createdAt).toLocaleDateString('ar-DZ')} - {new Date(notif.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-bold leading-relaxed">{notif.message}</p>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                  {notif.actionUrl && (
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl" aria-label={t('view_details') || 'View details'}>
                      <ExternalLink size={14} />
                    </div>
                  )}
                  <button 
                    onClick={(e) => handleDelete(e, notif._id)} 
                    aria-label={t('delete_notification') || 'Delete notification'} 
                    className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            /* N5: Contextual empty states */
            <FilterEmptyState 
              icon={currentEmpty.icon}
              title={t(currentEmpty.titleKey) || t('empty_all_title') || 'No notifications'}
              description={t(currentEmpty.descKey) || t('empty_all_desc') || 'No notifications match this filter'}
            />
          )}
        </div>

        {/* N6: Load older */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setDisplayLimit(prev => prev + LOAD_LIMIT)}
              className="px-8 py-3 bg-card border-border text-muted-foreground hover:text-foreground rounded-2xl font-bold text-sm transition-all shadow-sm"
            >
              {t('load_older') || 'Load older'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
