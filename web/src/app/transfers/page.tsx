'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  ArrowLeftRight,
  Building2,
  Globe,
  CreditCard,
  Bitcoin,
  Clock,
  CheckCircle2,
} from 'lucide-react';

type TransferType = 'internal' | 'domestic' | 'international' | 'card' | 'crypto';

const transferTypes: { type: TransferType; icon: typeof ArrowLeftRight; label: string }[] = [
  { type: 'internal', icon: ArrowLeftRight, label: 'Внутренний' },
  { type: 'domestic', icon: Building2, label: 'По стране' },
  { type: 'international', icon: Globe, label: 'Международный' },
  { type: 'card', icon: CreditCard, label: 'На карту' },
  { type: 'crypto', icon: Bitcoin, label: 'Крипто' },
];

const mockHistory = [
  { id: '1', recipient: 'Алексей Петров', amount: 25000, currency: 'RUB', status: 'completed', type: 'internal', date: '2026-05-29T10:30:00Z' },
  { id: '2', recipient: 'John Smith (SWIFT)', amount: 1500, currency: 'USD', status: 'processing', type: 'international', date: '2026-05-28T14:00:00Z' },
  { id: '3', recipient: '0x1a2b...9f8e', amount: 0.5, currency: 'ETH', status: 'completed', type: 'crypto', date: '2026-05-27T09:15:00Z' },
  { id: '4', recipient: 'Мария Иванова', amount: 50000, currency: 'RUB', status: 'completed', type: 'card', date: '2026-05-26T16:45:00Z' },
];

export default function TransfersPage() {
  const [selectedType, setSelectedType] = useState<TransferType>('internal');
  const router = useRouter();

  return (
    <AppShell>
      <h1 className="text-header text-atlas-text mb-6">Переводы</h1>

      {/* Transfer Type Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {transferTypes.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors ${
              selectedType === type
                ? 'bg-atlas-accent/15 text-atlas-accent border border-atlas-accent/30'
                : 'bg-atlas-card border border-white/10 text-atlas-text-secondary hover:text-atlas-text'
            }`}
          >
            <Icon size={16} />
            <span className="text-secondary font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Transfer Form */}
      <Card className="mb-6">
        <div className="space-y-4">
          <Input label="Получатель" placeholder="Имя, телефон, email или адрес" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Сумма" placeholder="0.00" type="number" />
            <Input label="Валюта" placeholder="RUB" />
          </div>
          <Input label="Описание" placeholder="Назначение платежа (необязательно)" />

          <div className="flex items-center justify-between py-3 border-t border-white/5">
            <span className="text-secondary text-atlas-text-secondary">Комиссия</span>
            <span className="text-secondary text-atlas-text">0 ₽</span>
          </div>

          <Button className="w-full" size="lg" onClick={() => router.push('/transfers/new')}>
            Отправить
          </Button>
        </div>
      </Card>

      {/* Transfer History */}
      <h2 className="text-card-title text-atlas-text mb-3">История</h2>
      <div className="space-y-1">
        {mockHistory.map((tx) => (
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
    </AppShell>
  );
}
