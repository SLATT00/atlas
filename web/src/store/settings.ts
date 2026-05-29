import { create } from 'zustand';

export type Theme = 'dark' | 'light';
export type Locale = 'ru' | 'en';
export type Currency = 'RUB' | 'USD' | 'EUR' | 'GBP' | 'AED';

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(`atlas-${key}`);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`atlas-${key}`, JSON.stringify(value));
}

interface SettingsState {
  theme: Theme;
  locale: Locale;
  currency: Currency;
  biometricEnabled: boolean;
  notificationsEnabled: boolean;

  setTheme: (t: Theme) => void;
  setLocale: (l: Locale) => void;
  setCurrency: (c: Currency) => void;
  setBiometric: (v: boolean) => void;
  setNotifications: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: load<Theme>('theme', 'dark'),
  locale: load<Locale>('locale', 'ru'),
  currency: load<Currency>('currency', 'RUB'),
  biometricEnabled: load<boolean>('biometric', false),
  notificationsEnabled: load<boolean>('notificationsEnabled', true),

  setTheme: (theme) => {
    save('theme', theme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', theme === 'light');
    }
    set({ theme });
  },
  setLocale: (locale) => {
    save('locale', locale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
    set({ locale });
  },
  setCurrency: (currency) => { save('currency', currency); set({ currency }); },
  setBiometric: (v) => { save('biometric', v); set({ biometricEnabled: v }); },
  setNotifications: (v) => { save('notificationsEnabled', v); set({ notificationsEnabled: v }); },
}));
