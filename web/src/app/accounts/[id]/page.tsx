'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/format';
import { useDataStore } from '@/store/data';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Download,
  Share2,
  ChevronLeft,
} from 'lucide-react';

export default function AccountDetailPage() {
  const { id } = useParams();
  const accountId = typeof id === 'string' ? id : id?.[0] ?? '';

  const accounts = useDataStore((s) => s.accounts);
  const transactions = useDataStore((s) => s.transactions);

  const account = accounts.find((a) => a.id === accountId);

  const accountTxs = useMemo(
    () => transactions
      .filter((t) => t.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions, accountId]
  );

  if (!account) {
    return (
      <AppShell>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/accounts" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <ChevronLeft size={20} className="text-atlas-text-secondary" />
          </Link>
          <h1 className="text-section text-atlas-text">Счёт не найден</h1>
        </div>
        <Card>
          <p className="text-secondary text-atlas-text-secondary text-center py-8">
            Счёт с указанным идентификатором не существует.
          </p>
          <Link href="/accounts">
            <Button variant="secondary" className="w-full mt-2">Вернуться к счетам</Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/accounts" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <div>
          <h1 className="text-section text-atlas-text">{account.currency} счёт</h1>
          <p className="text-label text-atlas-muted">{account.type === 'checking' ? 'Текущий' : account.type}</p>
        </div>
        <Badge variant={account.status === 'active' ? 'success' : 'warning'}>
          {account.status === 'active' ? 'Активен' : account.status}
        </Badge>
      </div>

      {/* Balance */}
      <Card className="mb-4">
        <p className="text-secondary text-atlas-text-secondary mb-1">Баланс</p>
        <p className="text-hero text-atlas-text">{formatCurrency(account.balance, account.currency)}</p>
        <p className="text-label text-atlas-muted mt-1">
          Доступно: {formatCurrency(account.available, account.currency)}
        </p>

        <div className="flex gap-2 mt-4">
          <Link href="/accounts" className="flex-1">
            <Button size="sm" className="w-full">
              <ArrowDownLeft size={14} className="mr-1.5" /> Пополнить
            </Button>
          </Link>
          <Link href="/transfers/new" className="flex-1">
            <Button size="sm" variant="secondary" className="w-full">
              <ArrowUpRight size={14} className="mr-1.5" /> Перевести
            </Button>
          </Link>
        </div>
      </Card>

      {/* Account Details */}
      <Card className="mb-4">
        <h3 className="text-card-title text-atlas-text mb-3">Реквизиты</h3>
        <div className="space-y-3">
          {[
            { label: 'Номер счёта', value: account.number },
            { label: 'IBAN', value: account.iban || '—' },
            { label: 'SWIFT/BIC', value: account.swift || '—' },
            { label: 'Банк', value: 'ATLAS Digital Bank' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-label text-atlas-muted">{item.label}</p>
                <p className="text-secondary text-atlas-text font-mono">{item.value}</p>
              </div>
              {item.value !== '—' && (
                <button
                  onClick={() => copyToClipboard(item.value)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Copy size={14} className="text-atlas-text-secondary" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Transactions */}
      <h2 className="text-card-title text-atlas-text mb-3">Операции</h2>
      {accountTxs.length === 0 ? (
        <p className="text-secondary text-atlas-muted text-center py-8">Нет операций</p>
      ) : (
        <div className="space-y-1">
          {accountTxs.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-atlas-card border border-white/10 flex items-center justify-center">
                  {tx.amount > 0 ? (
                    <ArrowDownLeft size={16} className="text-atlas-success" />
                  ) : (
                    <ArrowUpRight size={16} className="text-atlas-text-secondary" />
                  )}
                </div>
                <div>
                  <p className="text-secondary text-atlas-text">{tx.description}</p>
                  <p className="text-label text-atlas-muted">{formatDate(tx.date)}</p>
                </div>
              </div>
              <span className={tx.amount > 0 ? 'text-secondary text-atlas-success font-medium' : 'text-secondary text-atlas-text font-medium'}>
                {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount), tx.currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
