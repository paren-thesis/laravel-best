import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import type { RoleName } from '../types';

interface RequireAuthProps {
  /** When present, the signed-in user must hold at least one of these roles. */
  roles?: RoleName[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ roles }) => {
  const { user, token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token && !user) fetchMe();
  }, [token, user, fetchMe]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // A token was restored from storage but the profile has not arrived yet.
  // Showing the login screen here would bounce a signed-in user out on refresh.
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <span className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm">Restoring your session...</span>
        </div>
      </div>
    );
  }

  if (roles && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
