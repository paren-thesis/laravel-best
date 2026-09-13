import React from 'react';
import { Bell, X } from 'lucide-react';
import { useUiStore } from '../store/useUiStore';

export const NotificationToast: React.FC = () => {
  const notifications = useUiStore((state) => state.notifications);
  const dismissNotification = useUiStore((state) => state.dismissNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {notifications.map((n, index) => (
        <div
          key={index}
          className="pointer-events-auto bg-slate-900/95 border border-indigo-500/40 text-slate-100 p-4 rounded-2xl shadow-2xl shadow-indigo-500/10 backdrop-blur-xl flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-xs text-indigo-300 uppercase tracking-wider">
                Live System Alert
              </div>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{n.message}</p>
            </div>
          </div>
          <button
            onClick={() => dismissNotification(index)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
