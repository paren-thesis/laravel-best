import { create } from 'zustand';
import type { LiveNotification } from '../types';

interface UiState {
  /** Banner shown at the top of the dashboard after an action completes. */
  message: string;
  setMessage: (message: string) => void;
  clearMessage: () => void;

  /** Toasts pushed in by Soketi broadcasts. */
  notifications: LiveNotification[];
  pushNotification: (notification: LiveNotification) => void;
  dismissNotification: (index: number) => void;
}

export const useUiStore = create<UiState>((set) => ({
  message: '',
  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: '' }),

  notifications: [],
  pushNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  dismissNotification: (index) =>
    set((state) => ({ notifications: state.notifications.filter((_, i) => i !== index) })),
}));
