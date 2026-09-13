import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export const AUTH_TOKEN_KEY = 'htu_auth_token';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
