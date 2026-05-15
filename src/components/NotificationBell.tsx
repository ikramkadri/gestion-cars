import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id, Doc } from '../../convex/_generated/dataModel';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("convex_token") || "";

  // جلب التنبيهات غير المقروءة (Doc<"notifications">[])
  const notifications = useQuery(api.notifications.getUnreadNotifications, { token }) as Doc<"notifications">[] | undefined;
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: Id<"notifications">) => {
    try {
      await markAsRead({ token, notificationId: id });
    } catch (error) {
      console.error("خطأ في تحديد الإشعار كمقروء:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ token });
      toast.success("تم تحديد الكل كمقروء");
    } catch (error) {
      console.error("خطأ في تحديد الكل كمقروء:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={16} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
      case 'error': return <XCircle className="text-rose-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  if (!token) return null;

  return (
    <div className="relative" ref={dropdownRef} dir="rtl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-400 hover:text-blue-500 transition-all bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 active:scale-95 shadow-lg shadow-black/20"
      >
        <Bell size={22} />
        {notifications && notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-4 w-85 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 z-[1000] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
            <h3 className="font-black text-slate-900 dark:text-white text-sm">الإشعارات</h3>
            {notifications && notifications.length > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications === undefined ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-blue-600" size={24} />
                <span className="text-xs font-bold text-slate-400">جاري التحميل...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
                   <Bell size={32} />
                </div>
                <p className="text-slate-400 font-bold text-sm italic">لا توجد إشعارات جديدة حالياً</p>
              </div>
            ) : (
              notifications.map((n: Doc<"notifications">) => (
                <div 
                  key={n._id} 
                  className="p-5 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group flex items-start gap-4 text-right"
                >
                  <div className="mt-1.5 p-2 bg-slate-50 dark:bg-white/5 rounded-xl">{getIcon(n.type)}</div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900 dark:text-white text-xs mb-1.5">{n.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{n.message}</p>
                    <p className="text-[9px] text-slate-400 mt-2.5 font-black uppercase tracking-wider">
                      {new Date(n.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleMarkAsRead(n._id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-xl transition-all shadow-sm"
                    title="تحديد كمقروء"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-slate-50/50 dark:bg-white/5 text-center border-t border-slate-100 dark:border-slate-800">
             <button className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">عرض سجل التنبيهات</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;