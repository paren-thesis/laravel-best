import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { visibleNavItems } from '../routes/navigation';
import { ThemeToggle } from './ThemeToggle';

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
    <header className="border-b border-line bg-panel backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-ink tracking-tight text-sm sm:text-base leading-tight">
                <span className="sm:hidden">HTU FYP System</span>
                <span className="hidden sm:inline">HTU Final Year Project System</span>
              </h1>
              <p className="text-xs text-ink-muted truncate">
                Ho Technical University — CS Department
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Panel members score signed in as themselves, so who that is
                should be visible on a phone too, not only from sm upwards. */}
            <div className="text-right min-w-0 max-w-[8rem] sm:max-w-none">
              <div className="text-xs sm:text-sm font-semibold text-ink-body truncate">
                {user.name}
              </div>
              <div className="text-[10px] sm:text-xs text-accent capitalize font-mono truncate">
                {user.roles.join(' • ')}
              </div>
            </div>
            <ThemeToggle />

            <button
              onClick={logout}
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-raised hover:bg-raised-hover text-ink-body transition-all shrink-0"
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
                    ? 'border-indigo-500 text-accent'
                    : 'border-transparent text-ink-muted hover:text-ink-body hover:border-line-strong',
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
