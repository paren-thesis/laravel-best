import { create } from 'zustand';
import api from '../api/axios';

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  profile?: any;
  supervisor_profile?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('htu_auth_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem('htu_auth_token', access_token);
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
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('htu_auth_token');
      set({ user: null, token: null });
    }
  },

  fetchMe: async () => {
    if (!localStorage.getItem('htu_auth_token')) return;
    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isLoading: false });
    } catch (err) {
      localStorage.removeItem('htu_auth_token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
