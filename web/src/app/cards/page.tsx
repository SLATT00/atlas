'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/format';
import { useDataStore } from '@/store/data';
import { Plus, Snowflake, Settings, Eye } from 'lucide-react';

const cardGradients: Record<string, string> = {
  metal: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900',
  virtual: 'bg-gradient-to-br from-atlas-accent/30 via-atlas-card to-purple-900/30',
  travel: 'bg-gradient-to-br from-blue-900/50 via-atlas-card to-indigo-900/30',
  standard: 'bg-gradient-to-br from-atlas-card to-atlas-elevated',
};

export default function CardsPage() {
  const cards = useDataStore((s) => s.cards);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-header text-atlas-text">Карты</h1>
        <Button size="sm" variant="secondary">
          <Plus size={16} className="mr-1.5" />
          Заказать
        </Button>
      </div>

      <div className="space-y-4">
        {cards.map((card) => (
          <Link key={card.id} href={`/cards/${card.id}`} className="block space-y-3">
            <div className={`${cardGradients[card.type] || cardGradients.standard} rounded-2xl p-5 border border-white/10 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-secondary text-atlas-text font-semibold">{card.typeName}</span>
                  <Badge variant={card.status === 'active' ? 'success' : 'warning'}>
                    {card.status === 'active' ? 'Активна' : 'Заморожена'}
                  </Badge>
                </div>
                <p className="text-section text-atlas-text tracking-widest mb-4">
                  •••• •••• •••• {card.last4}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-label text-atlas-text-secondary">
                    {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
                  </span>
                  <span className="text-secondary text-atlas-text-secondary font-medium">{card.network}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 glass-card p-3">
                <p className="text-label text-atlas-muted mb-0.5">Расходы</p>
                <p className="text-secondary text-atlas-text font-semibold">
                  {formatCurrency(card.spent, card.currency)}
                </p>
                <div className="mt-2 h-1.5 bg-atlas-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-atlas-accent rounded-full"
                    style={{ width: `${Math.min((card.spent / card.monthlyLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="p-2.5 glass-card"><Snowflake size={16} className="text-atlas-text-secondary" /></span>
                <span className="p-2.5 glass-card"><Eye size={16} className="text-atlas-text-secondary" /></span>
                <span className="p-2.5 glass-card"><Settings size={16} className="text-atlas-text-secondary" /></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
