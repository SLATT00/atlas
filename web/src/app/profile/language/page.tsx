'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { ChevronLeft, Globe } from 'lucide-react';
import { useSettingsStore } from '@/store/settings';

const languages = [
  { code: 'ru' as const, label: 'Русский', description: 'Русский язык интерфейса' },
  { code: 'en' as const, label: 'English', description: 'English interface language' },
];

export default function LanguagePage() {
  const { locale, setLocale } = useSettingsStore();

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <h1 className="text-section text-atlas-text">Язык</h1>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Globe size={18} className="text-atlas-text-secondary" />
          <h3 className="text-card-title text-atlas-text">Выберите язык</h3>
        </div>
        <div className="space-y-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={`w-full flex items-center justify-between py-3.5 px-4 rounded-xl transition-colors ${
                locale === lang.code
                  ? 'bg-atlas-accent/15 border border-atlas-accent/30'
                  : 'bg-atlas-elevated border border-white/5 hover:bg-white/5'
              }`}
            >
              <div className="text-left">
                <p
                  className={`text-body font-medium ${
                    locale === lang.code ? 'text-atlas-accent' : 'text-atlas-text'
                  }`}
                >
                  {lang.label}
                </p>
                <p className="text-label text-atlas-muted">{lang.description}</p>
              </div>
              {locale === lang.code && (
                <div className="w-5 h-5 rounded-full bg-atlas-accent flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
