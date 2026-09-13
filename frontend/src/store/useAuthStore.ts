import { create } from 'zustand';
import api, { AUTH_TOKEN_KEY } from '../api/axios';
import type { AuthUser, LoginResponse, MeResponse, RoleName } from '../types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  hasRole: (...roles: RoleName[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem(AUTH_TOKEN_KEY),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem(AUTH_TOKEN_KEY, access_token);
      set({ token: access_token, user, isLoading: false });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // The token is being discarded either way.
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      set({ user: null, token: null });
    }
  },

  fetchMe: async () => {
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) return;
    set({ isLoading: true });
    try {
      const response = await api.get<MeResponse>('/auth/me');
      set({ user: response.data.user, isLoading: false });
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      set({ user: null, token: null, isLoading: false });
    }
  },

  hasRole: (...roles) => {
    const user = get().user;
    return user ? roles.some((role) => user.roles.includes(role)) : false;
  },
}));
