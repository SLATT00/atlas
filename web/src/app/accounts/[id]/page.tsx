'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Download,
  Share2,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

const mockAccount = {
  id: '1',
  currency: 'RUB',
  type: 'checking',
  balance: 8_450_000,
  available: 8_200_000,
  number: '40817810000012345678',
  iban: 'RU12 3456 7890 1234 5678 9012 345',
  swift: 'ATLSRUMM',
  bic: '044525000',
  bankName: 'ATLAS Digital Bank',
};

const mockTransactions = [
  { id: '1', description: 'Перевод Алексею П.', amount: -25000, type: 'transfer', date: '2026-05-29T10:30:00Z', status: 'completed' },
  { id: '2', description: 'Зарплата ООО "Техно"', amount: 450000, type: 'deposit', date: '2026-05-28T09:00:00Z', status: 'completed' },
  { id: '3', description: 'Netflix подписка', amount: -999, type: 'payment', date: '2026-05-27T18:45:00Z', status: 'completed' },
  { id: '4', description: 'Обмен BTC → RUB', amount: 180000, type: 'exchange', date: '2026-05-27T14:20:00Z', status: 'completed' },
  { id: '5', description: 'Яндекс.Еда', amount: -2350, type: 'payment', date: '2026-05-26T20:10:00Z', status: 'completed' },
  { id: '6', description: 'Перевод от Марии И.', amount: 15000, type: 'transfer', date: '2026-05-26T12:00:00Z', status: 'completed' },
  { id: '7', description: 'Spotify', amount: -299, type: 'payment', date: '2026-05-25T08:00:00Z', status: 'completed' },
  { id: '8', description: 'Кэшбэк за май', amount: 3200, type: 'cashback', date: '2026-05-25T00:00:00Z', status: 'completed' },
];

export default function AccountDetailPage() {
  const { id } = useParams();

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/accounts" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <div>
          <h1 className="text-section text-atlas-text">RUB счёт</h1>
          <p className="text-label text-atlas-muted">Текущий</p>
        </div>
        <Badge variant="success">Активен</Badge>
      </div>

      {/* Balance */}
      <Card className="mb-4">
        <p className="text-secondary text-atlas-text-secondary mb-1">Баланс</p>
        <p className="text-hero text-atlas-text">{formatCurrency(mockAccount.balance, 'RUB')}</p>
        <p className="text-label text-atlas-muted mt-1">
          Доступно: {formatCurrency(mockAccount.available, 'RUB')}
        </p>

        <div className="flex gap-2 mt-4">
          <Button size="sm" className="flex-1">
            <ArrowDownLeft size={14} className="mr-1.5" /> Пополнить
          </Button>
          <Button size="sm" variant="secondary" className="flex-1">
            <ArrowUpRight size={14} className="mr-1.5" /> Перевести
          </Button>
        </div>
      </Card>

      {/* Account Details */}
      <Card className="mb-4">
        <h3 className="text-card-title text-atlas-text mb-3">Реквизиты</h3>
        <div className="space-y-3">
          {[
            { label: 'Номер счёта', value: mockAccount.number },
            { label: 'IBAN', value: mockAccount.iban },
            { label: 'SWIFT/BIC', value: mockAccount.swift },
            { label: 'БИК', value: mockAccount.bic },
            { label: 'Банк', value: mockAccount.bankName },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-label text-atlas-muted">{item.label}</p>
                <p className="text-secondary text-atlas-text font-mono">{item.value}</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Copy size={14} className="text-atlas-text-secondary" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
          <Button size="sm" variant="ghost" className="flex-1">
            <Download size={14} className="mr-1.5" /> Выписка
          </Button>
          <Button size="sm" variant="ghost" className="flex-1">
            <Share2 size={14} className="mr-1.5" /> Поделиться
          </Button>
        </div>
      </Card>

      {/* Transactions */}
      <h2 className="text-card-title text-atlas-text mb-3">Операции</h2>
      <div className="space-y-1">
        {mockTransactions.map((tx) => (
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
              {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount), 'RUB')}
            </span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
