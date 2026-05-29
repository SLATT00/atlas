'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { ChevronLeft, Bell, CreditCard, ArrowLeftRight, Shield, TrendingUp, Landmark } from 'lucide-react';

interface NotifToggleProps {
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  onToggle: () => void;
}

function NotifToggle({ label, description, icon: Icon, enabled, onToggle }: NotifToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-atlas-text-secondary" />
        <div>
          <p className="text-body text-atlas-text">{label}</p>
          <p className="text-label text-atlas-muted">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          enabled ? 'bg-atlas-accent' : 'bg-atlas-card border border-white/20'
        }`}
      >
        <div
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: enabled ? 'translateX(22px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState({
    transfers: true,
    cards: true,
    security: true,
    savings: true,
    loans: true,
    marketing: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <h1 className="text-section text-atlas-text">Уведомления</h1>
      </div>

      <Card>
        <div className="divide-y divide-white/5">
          <NotifToggle label="Переводы" description="Входящие и исходящие" icon={ArrowLeftRight} enabled={settings.transfers} onToggle={() => toggle('transfers')} />
          <NotifToggle label="Карты" description="Операции и лимиты" icon={CreditCard} enabled={settings.cards} onToggle={() => toggle('cards')} />
          <NotifToggle label="Безопасность" description="Входы и подозрительная активность" icon={Shield} enabled={settings.security} onToggle={() => toggle('security')} />
          <NotifToggle label="Накопления" description="Начисление процентов" icon={TrendingUp} enabled={settings.savings} onToggle={() => toggle('savings')} />
          <NotifToggle label="Займы" description="Платежи и LTV" icon={Landmark} enabled={settings.loans} onToggle={() => toggle('loans')} />
          <NotifToggle label="Маркетинг" description="Акции и предложения" icon={Bell} enabled={settings.marketing} onToggle={() => toggle('marketing')} />
        </div>
      </Card>
    </AppShell>
  );
}
