'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercent, formatDate } from '@/lib/format';
import {
  Plus,
  ArrowUpRight,
  RefreshCw,
  CreditCard,
  Landmark,
  FileText,
} from 'lucide-react';

const quickActions = [
  { icon: Plus, label: 'Пополнить', color: 'text-atlas-success', href: '/accounts' },
  { icon: ArrowUpRight, label: 'Перевести', color: 'text-atlas-accent', href: '/transfers/new' },
  { icon: RefreshCw, label: 'Обменять', color: 'text-atlas-warning', href: '/exchange' },
  { icon: CreditCard, label: 'Карта', color: 'text-atlas-text', href: '/cards' },
  { icon: Landmark, label: 'Займ', color: 'text-purple-400', href: '/products' },
  { icon: FileText, label: 'Реквизиты', color: 'text-atlas-text-secondary', href: '/accounts/1' },
];

const mockAssets = [
  { label: 'Фиат', value: 8_450_000, percent: 68, color: 'bg-atlas-accent' },
  { label: 'Крипто', value: 2_800_000, percent: 22, color: 'bg-purple-500' },
  { label: 'Накопления', value: 1_000_000, percent: 8, color: 'bg-atlas-success' },
  { label: 'Инвестиции', value: 200_000, percent: 2, color: 'bg-atlas-warning' },
];

const mockTransactions = [
  { id: '1', description: 'Перевод Алексею', amount: -25000, currency: 'RUB', date: '2026-05-29T10:30:00Z', type: 'transfer' },
  { id: '2', description: 'Зарплата', amount: 450000, currency: 'RUB', date: '2026-05-28T09:00:00Z', type: 'deposit' },
  { id: '3', description: 'Netflix', amount: -999, currency: 'RUB', date: '2026-05-27T18:45:00Z', type: 'payment' },
  { id: '4', description: 'BTC → RUB', amount: 180000, currency: 'RUB', date: '2026-05-27T14:20:00Z', type: 'exchange' },
  { id: '5', description: 'Яндекс.Еда', amount: -2350, currency: 'RUB', date: '2026-05-26T20:10:00Z', type: 'payment' },
];

export default function HomePage() {
  const totalWealth = 12_450_000;
  const monthChange = 2.3;

  return (
    <AppShell>
      {/* Hero */}
      <section className="mb-6">
        <p className="text-secondary text-atlas-text-secondary mb-1">Общий капитал</p>
        <h1 className="text-hero text-atlas-text">{formatCurrency(totalWealth, 'RUB')}</h1>
        <p className="text-secondary text-atlas-success mt-1">
          {formatPercent(monthChange)} за месяц
        </p>
      </section>

      {/* Asset Allocation */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden flex">
            {mockAssets.map((a) => (
              <div key={a.label} className={`${a.color} h-full`} style={{ width: `${a.percent}%` }} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {mockAssets.map((a) => (
            <div key={a.label} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${a.color}`} />
              <span className="text-secondary text-atlas-text-secondary">{a.label}</span>
              <span className="text-secondary text-atlas-text ml-auto">{a.percent}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <section className="mb-6">
        <div className="grid grid-cols-6 gap-1">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-atlas-card border border-white/10 flex items-center justify-center">
                  <Icon size={20} className={action.color} />
                </div>
                <span className="text-[11px] text-atlas-text-secondary font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-card-title text-atlas-text mb-3">Последние операции</h2>
        <div className="space-y-1">
          {mockTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-atlas-card border border-white/10 flex items-center justify-center">
                  {tx.amount > 0 ? (
                    <Plus size={16} className="text-atlas-success" />
                  ) : (
                    <ArrowUpRight size={16} className="text-atlas-text-secondary" />
                  )}
                </div>
                <div>
                  <p className="text-secondary text-atlas-text">{tx.description}</p>
                  <p className="text-label text-atlas-muted">{formatDate(tx.date)}</p>
                </div>
              </div>
              <span className={tx.amount > 0 ? 'text-secondary text-atlas-success' : 'text-secondary text-atlas-text'}>
                {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount), tx.currency)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
