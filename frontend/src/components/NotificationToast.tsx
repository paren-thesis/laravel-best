import React from 'react';
import { Bell, X } from 'lucide-react';

interface ToastProps {
  notifications: any[];
  onDismiss: (index: number) => void;
}

export const NotificationToast: React.FC<ToastProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {notifications.map((n, index) => (
        <div
          key={index}
          className="pointer-events-auto bg-slate-900/95 border border-indigo-500/40 text-slate-100 p-4 rounded-2xl shadow-2xl shadow-indigo-500/10 backdrop-blur-xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mt-0.5">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="font-semibold text-xs text-indigo-300 uppercase tracking-wider">Live System Alert</div>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{n.message}</p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(index)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
