import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  phone: string;
  language: string;
  status: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('atlas-token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('atlas-token') : false,
  login: (user, token) => {
    localStorage.setItem('atlas-token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('atlas-token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
