'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Globe, Moon, Sun, Palette } from 'lucide-react';

export default function SettingsPage() {
  const [language, setLanguage] = useState('ru');
  const [theme, setTheme] = useState('dark');
  const [currency, setCurrency] = useState('RUB');

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
          {[
            { code: 'ru', label: 'Русский' },
            { code: 'en', label: 'English' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex-1 py-2.5 rounded-xl text-secondary font-medium transition-colors ${
                language === lang.code
                  ? 'bg-atlas-accent/15 text-atlas-accent border border-atlas-accent/30'
                  : 'bg-atlas-elevated text-atlas-text-secondary border border-white/5'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Theme */}
      <Card className="mb-3">
        <div className="flex items-center gap-3 mb-3">
          <Palette size={18} className="text-atlas-text-secondary" />
          <h3 className="text-card-title text-atlas-text">Тема</h3>
        </div>
        <div className="flex gap-2">
          {[
            { code: 'dark', label: 'Тёмная', icon: Moon },
            { code: 'light', label: 'Светлая', icon: Sun },
          ].map(({ code, label, icon: Icon }) => (
            <button
              key={code}
              onClick={() => setTheme(code)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-secondary font-medium transition-colors ${
                theme === code
                  ? 'bg-atlas-accent/15 text-atlas-accent border border-atlas-accent/30'
                  : 'bg-atlas-elevated text-atlas-text-secondary border border-white/5'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Default Currency */}
      <Card className="mb-3">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-atlas-text-secondary text-lg">₽</span>
          <h3 className="text-card-title text-atlas-text">Основная валюта</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['RUB', 'USD', 'EUR'].map((cur) => (
            <button
              key={cur}
              onClick={() => setCurrency(cur)}
              className={`py-2.5 rounded-xl text-secondary font-medium transition-colors ${
                currency === cur
                  ? 'bg-atlas-accent/15 text-atlas-accent border border-atlas-accent/30'
                  : 'bg-atlas-elevated text-atlas-text-secondary border border-white/5'
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
      </Card>

      <Button className="w-full mt-4" size="lg">
        Сохранить настройки
      </Button>
    </AppShell>
  );
}
