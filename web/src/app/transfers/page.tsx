'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/format';
import { useDataStore } from '@/store/data';
import {
  ArrowLeftRight,
  Building2,
  Globe,
  CreditCard,
  Bitcoin,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';

export default function TransfersPage() {
  const router = useRouter();
  const transfers = useDataStore((s) => s.transfers);

  const sortedTransfers = useMemo(
    () => [...transfers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transfers]
  );

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-header text-atlas-text">Переводы</h1>
        <Button size="sm" onClick={() => router.push('/transfers/new')}>
          <Plus size={16} className="mr-1.5" />
          Новый
        </Button>
      </div>

      {/* Quick Type Buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {[
          { icon: ArrowLeftRight, label: 'Внутренний' },
          { icon: Building2, label: 'По стране' },
          { icon: Globe, label: 'Международный' },
          { icon: CreditCard, label: 'На карту' },
          { icon: Bitcoin, label: 'Крипто' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => router.push('/transfers/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap bg-atlas-card border border-white/10 text-atlas-text-secondary hover:text-atlas-text transition-colors"
          >
            <Icon size={16} />
            <span className="text-secondary font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Transfer History */}
      <h2 className="text-card-title text-atlas-text mb-3">История</h2>
      {sortedTransfers.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-secondary text-atlas-muted mb-4">Нет переводов</p>
            <Button size="sm" onClick={() => router.push('/transfers/new')}>
              Создать первый перевод
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-1">
          {sortedTransfers.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-atlas-card border border-white/10 flex items-center justify-center">
                  {tx.status === 'completed' ? (
                    <CheckCircle2 size={16} className="text-atlas-success" />
                  ) : (
                    <Clock size={16} className="text-atlas-warning" />
                  )}
                </div>
                <div>
                  <p className="text-secondary text-atlas-text">{tx.recipient}</p>
                  <p className="text-label text-atlas-muted">{formatDate(tx.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-secondary text-atlas-text">
                  -{formatCurrency(tx.amount, tx.currency)}
                </p>
                <Badge variant={tx.status === 'completed' ? 'success' : 'warning'}>
                  {tx.status === 'completed' ? 'Выполнен' : 'В обработке'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
