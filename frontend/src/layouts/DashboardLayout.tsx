import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { NotificationToast } from '../components/NotificationToast';
import { useUiStore } from '../store/useUiStore';
import { queryKeys } from '../api/queries';
import { echo } from '../api/echo';
import type { LiveNotification } from '../types';

export const DashboardLayout: React.FC = () => {
  const message = useUiStore((state) => state.message);
  const clearMessage = useUiStore((state) => state.clearMessage);
  const pushNotification = useUiStore((state) => state.pushNotification);
  const queryClient = useQueryClient();
  const location = useLocation();

  // Broadcasts arrive for the whole dashboard, so subscribe once at the layout
  // rather than in individual pages.
  useEffect(() => {
    if (!echo) return;

    const channel = echo.channel('fyp-notifications');

    channel.listen('.topic.updated', (event: LiveNotification) => {
      pushNotification(event);
      queryClient.invalidateQueries({ queryKey: queryKeys.topics });
    });

    channel.listen('.supervisor.assigned', (event: LiveNotification) => {
      pushNotification(event);
      queryClient.invalidateQueries({ queryKey: queryKeys.supervisions });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
    });

    return () => {
      echo?.leaveChannel('fyp-notifications');
    };
  }, [queryClient, pushNotification]);

  // A confirmation from one page should not linger on the next.
  useEffect(() => {
    clearMessage();
  }, [location.pathname, clearMessage]);

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {message && (
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm flex items-center justify-between gap-4">
            <span>{message}</span>
            <button onClick={clearMessage} className="text-xs underline text-accent shrink-0">
              Dismiss
            </button>
          </div>
        )}

        <Outlet />
      </main>

      <NotificationToast />
    </div>
  );
};
