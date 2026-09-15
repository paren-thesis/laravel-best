import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'htu_theme';

const prefersDark = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

/** The palette a preference resolves to right now. */
export const resolveTheme = (preference: ThemePreference): 'light' | 'dark' =>
  preference === 'system' ? (prefersDark() ? 'dark' : 'light') : preference;

const readStoredPreference = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Private browsing can refuse storage; fall back to following the system.
  }
  return 'system';
};

const applyTheme = (preference: ThemePreference): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', resolveTheme(preference) === 'dark');
};

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** Flips between light and dark, resolving `system` to its current value first. */
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: readStoredPreference(),

  setPreference: (preference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // A preference that cannot be stored still applies for this visit.
    }
    applyTheme(preference);
    set({ preference });
  },

  toggle: () => {
    const next = resolveTheme(get().preference) === 'dark' ? 'light' : 'dark';
    get().setPreference(next);
  },
}));

/**
 * Applies the stored preference and keeps `system` in step with the OS.
 * Called once at startup, before React renders, to avoid a flash of the
 * wrong palette.
 */
export const initTheme = (): void => {
  const { preference } = useThemeStore.getState();
  applyTheme(preference);

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (useThemeStore.getState().preference === 'system') {
      applyTheme('system');
    }
  });
};
