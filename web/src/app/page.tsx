'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercent, formatDate } from '@/lib/format';
import { useDataStore } from '@/store/data';
import { useSettingsStore } from '@/store/settings';
import {
  Plus,
  ArrowUpRight,
  RefreshCw,
  CreditCard,
  Landmark,
  FileText,
  Bell,
} from 'lucide-react';

const quickActions = [
  { icon: Plus, label: 'Пополнить', color: 'text-atlas-success', href: '/accounts' },
  { icon: ArrowUpRight, label: 'Перевести', color: 'text-atlas-accent', href: '/transfers/new' },
  { icon: RefreshCw, label: 'Обменять', color: 'text-atlas-warning', href: '/exchange' },
  { icon: CreditCard, label: 'Карта', color: 'text-atlas-text', href: '/cards' },
  { icon: Landmark, label: 'Займ', color: 'text-purple-400', href: '/products' },
  { icon: FileText, label: 'Реквизиты', color: 'text-atlas-text-secondary', href: '/accounts/1' },
];

// Exchange rates to RUB
const RATES_TO_RUB: Record<string, number> = {
  RUB: 1,
  USD: 92,
  EUR: 100,
  GBP: 116,
  AED: 25,
};

// Approximate crypto prices in RUB
const CRYPTO_PRICES_RUB: Record<string, number> = {
  BTC: 9_200_000,
  ETH: 340_000,
  TON: 550,
  SOL: 15_000,
  USDT: 92,
  USDC: 92,
};

export default function HomePage() {
  const accounts = useDataStore((s) => s.accounts);
  const transactions = useDataStore((s) => s.transactions);
  const wallets = useDataStore((s) => s.wallets);
  const savings = useDataStore((s) => s.savings);
  const notifications = useDataStore((s) => s.notifications);
  const currency = useSettingsStore((s) => s.currency);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Calculate total wealth in RUB from all sources
  const { totalWealth, fiatTotal, cryptoTotal, savingsTotal } = useMemo(() => {
    // Fiat accounts → RUB
    const fiat = accounts.reduce((sum, a) => {
      const rate = RATES_TO_RUB[a.currency] || 1;
      return sum + a.balance * rate;
    }, 0);

    // Crypto wallets → RUB
    const crypto = wallets.reduce((sum, w) => {
      const price = CRYPTO_PRICES_RUB[w.asset] || 0;
      return sum + w.balance * price;
    }, 0);

    // Savings → RUB
    const sav = savings.reduce((sum, s) => {
      const rate = RATES_TO_RUB[s.currency] || CRYPTO_PRICES_RUB[s.currency] || 1;
      return sum + s.balance * rate;
    }, 0);

    return {
      totalWealth: fiat + crypto + sav,
      fiatTotal: fiat,
      cryptoTotal: crypto,
      savingsTotal: sav,
    };
  }, [accounts, wallets, savings]);

  // Asset allocation percentages
  const assets = useMemo(() => {
    const total = totalWealth || 1; // avoid division by zero
    const investmentsTotal = 0; // placeholder for future investments

    return [
      { label: 'Фиат', value: fiatTotal, percent: Math.round((fiatTotal / total) * 100), color: 'bg-atlas-accent' },
      { label: 'Крипто', value: cryptoTotal, percent: Math.round((cryptoTotal / total) * 100), color: 'bg-purple-500' },
      { label: 'Накопления', value: savingsTotal, percent: Math.round((savingsTotal / total) * 100), color: 'bg-atlas-success' },
      { label: 'Инвестиции', value: investmentsTotal, percent: Math.round((investmentsTotal / total) * 100), color: 'bg-atlas-warning' },
    ];
  }, [totalWealth, fiatTotal, cryptoTotal, savingsTotal]);

  // Recent transactions sorted by date (last 5)
  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [transactions]
  );

  return (
    <AppShell>
      {/* Header with notification bell */}
      <div className="flex items-center justify-between mb-4">
        <div />
        <Link href="/profile" className="relative p-2 -mr-2 rounded-xl hover:bg-white/5 transition-colors">
          <Bell size={22} className="text-atlas-text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-atlas-error text-white text-[11px] font-semibold px-1">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* Hero */}
      <section className="mb-6">
        <p className="text-secondary text-atlas-text-secondary mb-1">Общий капитал</p>
        <h1 className="text-hero text-atlas-text">{formatCurrency(totalWealth, 'RUB')}</h1>
        <p className="text-secondary text-atlas-success mt-1">
          {formatPercent(2.3)} за месяц
        </p>
      </section>

      {/* Asset Allocation */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden flex">
            {assets.map((a) => (
              <div key={a.label} className={`${a.color} h-full`} style={{ width: `${a.percent}%` }} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {assets.map((a) => (
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
        {recentTransactions.length === 0 ? (
          <p className="text-secondary text-atlas-muted py-6 text-center">Нет операций</p>
        ) : (
          <div className="space-y-1">
            {recentTransactions.map((tx) => (
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
        )}
      </section>
    </AppShell>
  );
}
