import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveTheme, THEME_STORAGE_KEY, useThemeStore } from './useThemeStore';

/** Pretends the operating system is set to dark or light. */
const setSystemDark = (dark: boolean) => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: dark && query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
};

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    setSystemDark(false);
    useThemeStore.setState({ preference: 'system' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('resolveTheme', () => {
    it('takes an explicit choice at face value', () => {
      setSystemDark(true);
      expect(resolveTheme('light')).toBe('light');
      setSystemDark(false);
      expect(resolveTheme('dark')).toBe('dark');
    });

    it('follows the system when the preference is system', () => {
      setSystemDark(true);
      expect(resolveTheme('system')).toBe('dark');
      setSystemDark(false);
      expect(resolveTheme('system')).toBe('light');
    });
  });

  it('puts the dark class on the document when dark is chosen', () => {
    useThemeStore.getState().setPreference('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('takes the dark class off again when light is chosen', () => {
    useThemeStore.getState().setPreference('dark');
    useThemeStore.getState().setPreference('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('remembers the choice so it survives a reload', () => {
    useThemeStore.getState().setPreference('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('toggles from whatever is showing, not from the stored word', () => {
    // Preference is `system` and the system is dark, so toggling must go light
    // rather than flipping the literal string to "dark".
    setSystemDark(true);
    useThemeStore.setState({ preference: 'system' });

    useThemeStore.getState().toggle();

    expect(useThemeStore.getState().preference).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles back and forth', () => {
    useThemeStore.getState().setPreference('light');
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().preference).toBe('dark');
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().preference).toBe('light');
  });

  it('still applies a theme when storage refuses to save it', () => {
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('storage disabled');
      });

    expect(() => useThemeStore.getState().setPreference('dark')).not.toThrow();
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    setItem.mockRestore();
  });
});
