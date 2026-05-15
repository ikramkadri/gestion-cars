import { useState, useMemo } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, BadgeCheck, Trash2, Loader2, Car, Settings, ShieldAlert, ExternalLink } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Doc, Id } from '../../convex/_generated/dataModel';

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const token = localStorage.getItem("convex_token") || "";
  const navigate = useNavigate();

  const notifications = useQuery(api.notifications.getAllNotifications, { token });
  const markAllRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotif = useMutation(api.notifications.deleteNotification);
  const markRead = useMutation(api.notifications.markAsRead);

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    if (filter === 'all' || filter === 'الكل') return notifications;
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleMarkAllRead = async () => {
    try {
      await markAllRead({ token });
      toast.success("تم تحديد الكل كمقروء");
    } catch {
      toast.error("فشل في تحديث التنبيهات");
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
      toast.success("تم حذف التنبيه");
    } catch {
      toast.error("فقط المسؤول يمكنه حذف التنبيهات");
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFC] p-4 md:p-10 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <Bell size={14} /> {unreadCount} تنبيهات جديدة
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              مركز <span className="text-indigo-600">الإشعارات</span>
            </h1>
            <p className="text-slate-400 font-bold mt-2 text-sm">
              سجل كامل للنشاطات، الحجوزات، وتحديثات النظام في MOTORIX.
            </p>
          </div>
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <CheckCheck size={18} /> تحديد الكل كمقروء
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { label: 'الكل', value: 'all' },
            { label: 'حجوزات', value: 'reservation' },
            { label: 'تحديثات', value: 'system' },
            { label: 'نجاح', value: 'success' },
            { label: 'تنبيهات', value: 'warning' }
          ].map((f) => (
            <button 
              key={f.value} 
              onClick={() => setFilter(f.value)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${filter === f.value ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
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
              className={`group relative bg-white p-5 rounded-[2rem] border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer 
                ${!notif.isRead ? 'border-indigo-500/20 bg-gradient-to-l from-indigo-50/30 to-white' : 'border-slate-100'}
                ${notif.priority === 'high' ? 'ring-2 ring-rose-500/10' : ''}`}
            >
              <div className="flex gap-4 items-center">
                <div className={`p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:scale-110 transition-all shadow-sm ${notif.priority === 'high' ? 'bg-rose-50 border-rose-100' : ''}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`font-black text-[15px] ${!notif.isRead ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {notif.title}
                      {notif.priority === 'high' && <span className="mr-2 text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">هام جداً</span>}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                      {new Date(notif.createdAt).toLocaleDateString('ar-DZ')} - {new Date(notif.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">{notif.message}</p>
                </div>
                <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {notif.actionUrl && (
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <ExternalLink size={14} />
                    </div>
                  )}
                  <button onClick={(e) => handleDelete(e, notif._id)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
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