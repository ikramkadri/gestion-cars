import { AlertTriangle, Ban, Info, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'warning' | 'info';
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  const variantStyles = {
    destructive: {
      icon: <Ban size={24} />,
      iconBg: 'bg-rose-100 dark:bg-rose-950/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800',
      ring: 'ring-rose-500/20',
    },
    warning: {
      icon: <AlertTriangle size={24} />,
      iconBg: 'bg-amber-100 dark:bg-amber-950/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800',
      ring: 'ring-amber-500/20',
    },
    info: {
      icon: <Info size={24} />,
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800',
      ring: 'ring-indigo-500/20',
    },
  };

  const vs = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={`relative z-10 bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden p-6 md:p-8 ${vs.ring} ring-2`}
      >
        <button
          onClick={() => onOpenChange(false)}
          aria-label="Close dialog"
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <X size={18} />
        </button>

        <div className={`w-14 h-14 rounded-2xl ${vs.iconBg} ${vs.iconColor} flex items-center justify-center mb-5`}>
          {vs.icon}
        </div>

        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
          {title}
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-8">
          {description}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 py-3.5 px-6 rounded-2xl font-black text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm text-white transition-all active:scale-[0.98] shadow-lg ${vs.buttonBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
