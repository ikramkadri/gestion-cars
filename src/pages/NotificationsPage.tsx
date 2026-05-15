import { useState, useMemo } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, BadgeCheck, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'react-hot-toast';
import { Id } from '../../convex/_generated/dataModel';

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const token = localStorage.getItem("convex_token") || "";

  const notifications = useQuery(api.notifications.getAllNotifications, { token });
  const markAllRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotif = useMutation(api.notifications.deleteNotification);
  const markRead = useMutation(api.notifications.markAsRead);

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    if (filter === 'all' || filter === 'الكل') return notifications;
    
    const mapping: Record<string, string> = {
      'مبيعات': 'success',
      'تحذيرات': 'warning',
      'تحديثات': 'info'
    };
    
    return notifications.filter(n => n.type === mapping[filter]);
  }, [notifications, filter]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead({ token });
      toast.success("تم تحديد الكل كمقروء");
    } catch {
      toast.error("فشل في تحديث التنبيهات");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <BadgeCheck className="text-emerald-500" />;
      case 'warning': return <AlertTriangle className="text-amber-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  if (notifications === undefined) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Bell className="text-amber-500" size={32} /> مركز التنبيهات
            </h1>
            <p className="text-slate-500 font-bold mt-2">تابع آخر النشاطات والعمليات في MOTORIX</p>
          </div>
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <CheckCheck size={18} /> تحديد الكل كمقروء
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          {['الكل', 'مبيعات', 'تحذيرات', 'تحديثات'].map((f) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full text-xs font-black transition-all ${filter === f || (f === 'الكل' && filter === 'all') ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-indigo-200'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredNotifications.map((notif) => (
            <div 
              key={notif._id} 
              onClick={() => !notif.isRead && markRead({ token, notificationId: notif._id })}
              className={`group relative bg-white p-6 rounded-[2rem] border transition-all hover:shadow-md cursor-pointer ${!notif.isRead ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100'}`}
            >
              <div className="flex gap-5 items-start">
                <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-black text-slate-800">{notif.title}</h3>
                    <span className="text-[10px] font-bold text-slate-400">{new Date(notif.createdAt).toLocaleTimeString('ar-DZ')}</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{notif.message}</p>
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