import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { resolveTheme, useThemeStore } from '../store/useThemeStore';

export const ThemeToggle: React.FC = () => {
  const preference = useThemeStore((state) => state.preference);
  const toggle = useThemeStore((state) => state.toggle);

  const active = resolveTheme(preference);
  const goingTo = active === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      title={`Switch to ${goingTo} mode`}
      aria-label={`Switch to ${goingTo} mode`}
      className="h-11 w-11 flex items-center justify-center rounded-xl bg-raised hover:bg-raised-hover text-ink-body transition-all shrink-0"
    >
      {active === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};
