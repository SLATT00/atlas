'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { ChevronLeft, Globe, Moon, Sun, Palette, Check } from 'lucide-react';
import { useSettingsStore, type Theme, type Locale, type Currency } from '@/store/settings';

const languages: { code: Locale; label: string }[] = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

const themes: { code: Theme; label: string; icon: typeof Moon }[] = [
  { code: 'dark', label: 'Тёмная', icon: Moon },
  { code: 'light', label: 'Светлая', icon: Sun },
];

const currencies: Currency[] = ['RUB', 'USD', 'EUR', 'GBP', 'AED'];

const currencyLabels: Record<Currency, string> = {
  RUB: '₽ RUB',
  USD: '$ USD',
  EUR: '€ EUR',
  GBP: '£ GBP',
  AED: 'د.إ AED',
};

export default function SettingsPage() {
  const { theme, locale, currency, setTheme, setLocale, setCurrency } = useSettingsStore();
  const { toast } = useToast();

  const handleTheme = (t: Theme) => {
    setTheme(t);
    toast('success', t === 'dark' ? 'Тёмная тема активирована' : 'Светлая тема активирована');
  };

  const handleLocale = (l: Locale) => {
    setLocale(l);
    toast('success', l === 'ru' ? 'Язык изменён на русский' : 'Language changed to English');
  };

  const handleCurrency = (c: Currency) => {
    setCurrency(c);
    toast('success', `Основная валюта: ${c}`);
  };

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <h1 className="text-section text-atlas-text">Настройки</h1>
      </div>

      {/* Language */}
      <Card className="mb-3">
        <div className="flex items-center gap-3 mb-3">
          <Globe size={18} className="text-atlas-text-secondary" />
          <h3 className="text-card-title text-atlas-text">Язык</h3>
        </div>
        <div className="flex gap-2">
          {languages.map((lang) => {
            const active = locale === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLocale(lang.code)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-secondary font-medium transition-colors ${
                  active
                    ? 'bg-atlas-accent/15 text-atlas-accent border border-atlas-accent/30'
                    : 'bg-atlas-elevated text-atlas-text-secondary border border-white/5'
                }`}
              >
                {active && <Check size={14} />}
                {lang.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Theme */}
      <Card className="mb-3">
        <div className="flex items-center gap-3 mb-3">
          <Palette size={18} className="text-atlas-text-secondary" />
          <h3 className="text-card-title text-atlas-text">Тема</h3>
        </div>
        <div className="flex gap-2">
          {themes.map(({ code, label, icon: Icon }) => {
            const active = theme === code;
            return (
              <button
                key={code}
                onClick={() => handleTheme(code)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-secondary font-medium transition-colors ${
                  active
                    ? 'bg-atlas-accent/15 text-atlas-accent border border-atlas-accent/30'
                    : 'bg-atlas-elevated text-atlas-text-secondary border border-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
                {active && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Default Currency */}
      <Card className="mb-3">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-atlas-text-secondary text-lg">₽</span>
          <h3 className="text-card-title text-atlas-text">Основная валюта</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {currencies.map((cur) => {
            const active = currency === cur;
            return (
              <button
                key={cur}
                onClick={() => handleCurrency(cur)}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-secondary font-medium transition-colors ${
                  active
                    ? 'bg-atlas-accent/15 text-atlas-accent border border-atlas-accent/30'
                    : 'bg-atlas-elevated text-atlas-text-secondary border border-white/5'
                }`}
              >
                {active && <Check size={14} />}
                {currencyLabels[cur]}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Confirmation hint */}
      <p className="text-center text-labels text-atlas-muted mt-6">
        Настройки сохраняются автоматически
      </p>
    </AppShell>
  );
}
