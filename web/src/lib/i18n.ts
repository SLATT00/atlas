import ru from '@/locales/ru.json';
import en from '@/locales/en.json';

type Messages = typeof ru;
type Locale = 'ru' | 'en';

const messages: Record<Locale, Messages> = { ru, en };

let currentLocale: Locale = 'ru';

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== 'undefined') {
    localStorage.setItem('atlas-locale', locale);
  }
}

export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('atlas-locale') as Locale | null;
    if (stored && messages[stored]) {
      currentLocale = stored;
    }
  }
  return currentLocale;
}

export function t(path: string): string {
  const keys = path.split('.');
  let result: unknown = messages[currentLocale];
  for (const key of keys) {
    if (result && typeof result === 'object') {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof result === 'string' ? result : path;
}

export function useLocale() {
  return { locale: getLocale(), setLocale, t };
}
