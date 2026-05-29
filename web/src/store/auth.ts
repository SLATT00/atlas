import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  language: string;
  status: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  demoLogin: () => void;
}

function loadUser(): { user: User | null; token: string | null } {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const token = localStorage.getItem('atlas-token');
    const userStr = localStorage.getItem('atlas-user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}

const initial = loadUser();

export const useAuthStore = create<AuthState>((set) => ({
  user: initial.user,
  token: initial.token,
  isAuthenticated: !!initial.token,

  login: (user, token) => {
    localStorage.setItem('atlas-token', token);
    localStorage.setItem('atlas-user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('atlas-token');
    localStorage.removeItem('atlas-user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  demoLogin: () => {
    const user: User = {
      id: 'demo_001',
      email: 'mikhail@atlas.bank',
      phone: '+7 (999) 123-45-67',
      name: 'Михаил Иванов',
      language: 'ru',
      status: 'active',
    };
    const token = 'demo-token-' + Date.now();
    localStorage.setItem('atlas-token', token);
    localStorage.setItem('atlas-user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
}));
