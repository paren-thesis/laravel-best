import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { visibleNavItems } from '../routes/navigation';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navRef = useRef<HTMLElement | null>(null);
  const { pathname } = useLocation();

  // On a narrow screen the tab strip scrolls, and the active tab can sit off
  // to the right where nothing hints at it. Bring it into view on navigation.
  useEffect(() => {
    const active = navRef.current?.querySelector('[aria-current="page"]');
    active?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [pathname]);

  if (!user) return null;

  const items = visibleNavItems(user.roles);

  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-100 tracking-tight text-sm sm:text-base leading-tight">
                <span className="sm:hidden">HTU FYP System</span>
                <span className="hidden sm:inline">HTU Final Year Project System</span>
              </h1>
              <p className="text-xs text-slate-400 truncate">
                Ho Technical University — CS Department
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Panel members score signed in as themselves, so who that is
                should be visible on a phone too, not only from sm upwards. */}
            <div className="text-right min-w-0 max-w-[8rem] sm:max-w-none">
              <div className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                {user.name}
              </div>
              <div className="text-[10px] sm:text-xs text-indigo-400 capitalize font-mono truncate">
                {user.roles.join(' • ')}
              </div>
            </div>
            <button
              onClick={logout}
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav
          ref={navRef}
          className="flex items-center gap-1 overflow-x-auto -mb-px scrollbar-none"
        >
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-2 px-3 min-h-11 text-sm font-medium whitespace-nowrap border-b-2 transition-all',
                  isActive
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700',
                ].join(' ')
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};
