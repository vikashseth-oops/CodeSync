import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(toast => {
        let Icon = Info;
        let iconColor = 'text-[#6366f1]';
        let borderColor = 'border-[#2e2e35]';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          iconColor = 'text-[#22c55e]';
          borderColor = 'border-[#22c55e]/30';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-[#ef4444]';
          borderColor = 'border-[#ef4444]/30';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg bg-[#1c1c20] border ${borderColor} shadow-xl shadow-black/50 text-[#e8e8ed] transition-all duration-200 animate-in slide-in-from-bottom-2`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-xs leading-normal">
              {toast.title && <div className="font-semibold text-white mb-0.5">{toast.title}</div>}
              <div className="text-[#9999a8] break-words text-[11px]">{toast.message}</div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDismiss?.(toast.id);
              }}
              className="pointer-events-auto text-[#5c5c6a] hover:text-white p-1 rounded hover:bg-[#26262c] transition-colors cursor-pointer flex-shrink-0 -mr-1 -mt-1"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

