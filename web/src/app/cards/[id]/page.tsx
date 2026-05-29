'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useDataStore } from '@/store/data';
import { formatCurrency } from '@/lib/format';
import {
  ChevronLeft,
  Snowflake,
  Eye,
  EyeOff,
  Globe,
  ShoppingBag,
  Wifi,
  Banknote,
  CreditCard,
  Settings,
  Play,
} from 'lucide-react';

interface ToggleProps {
  label: string;
  icon: React.ElementType;
  enabled: boolean;
  onToggle: () => void;
}

function ControlToggle({ label, icon: Icon, enabled, onToggle }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-atlas-text-secondary" />
        <span className="text-body text-atlas-text">{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          enabled ? 'bg-atlas-accent' : 'bg-atlas-card border border-white/20'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5.5 left-0.5' : 'left-0.5'
          }`}
          style={{ transform: enabled ? 'translateX(22px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

export default function CardDetailPage() {
  const { id } = useParams();
  const cardId = typeof id === 'string' ? id : id?.[0] ?? '';
  const { toast } = useToast();

  const cards = useDataStore((s) => s.cards);
  const freezeCard = useDataStore((s) => s.freezeCard);
  const unfreezeCard = useDataStore((s) => s.unfreezeCard);
  const updateCardControls = useDataStore((s) => s.updateCardControls);

  const card = cards.find((c) => c.id === cardId);

  const [showDetails, setShowDetails] = useState(false);

  if (!card) {
    return (
      <AppShell>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/cards" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <ChevronLeft size={20} className="text-atlas-text-secondary" />
          </Link>
          <h1 className="text-section text-atlas-text">Карта не найдена</h1>
        </div>
        <Card>
          <p className="text-secondary text-atlas-text-secondary text-center py-8">
            Карта с указанным идентификатором не существует.
          </p>
          <Link href="/cards">
            <Button variant="secondary" className="w-full mt-2">Вернуться к картам</Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  const isFrozen = card.status === 'frozen';

  const handleFreezeToggle = () => {
    if (isFrozen) {
      unfreezeCard(cardId);
      toast('success', 'Карта разморожена');
    } else {
      freezeCard(cardId);
      toast('info', 'Карта заморожена');
    }
  };

  const handleControlToggle = (key: keyof typeof card.controls) => {
    updateCardControls(cardId, { [key]: !card.controls[key] });
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/cards" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <div className="flex-1">
          <h1 className="text-section text-atlas-text">{card.typeName}</h1>
          <p className="text-label text-atlas-muted">{card.network} •••• {card.last4}</p>
        </div>
        <Badge variant={isFrozen ? 'warning' : 'success'}>
          {isFrozen ? 'Заморожена' : 'Активна'}
        </Badge>
      </div>

      {/* Card Visual */}
      <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-2xl p-5 border border-white/10 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center justify-between mb-10">
            <span className="text-secondary text-atlas-text font-semibold">{card.typeName}</span>
            <CreditCard size={24} className="text-atlas-text-secondary" />
          </div>
          <p className="text-section text-atlas-text tracking-[0.2em] mb-4 font-mono">
            {showDetails ? '4276 8901 2345 ' + card.last4 : '•••• •••• •••• ' + card.last4}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label text-atlas-muted">Держатель</p>
              <p className="text-secondary text-atlas-text">{card.holder}</p>
            </div>
            <div className="text-right">
              <p className="text-label text-atlas-muted">Срок</p>
              <p className="text-secondary text-atlas-text">
                {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
              </p>
            </div>
            {showDetails && (
              <div className="text-right">
                <p className="text-label text-atlas-muted">CVV</p>
                <p className="text-secondary text-atlas-text">•••</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-6">
        <Button size="sm" variant="secondary" className="flex-1" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? <EyeOff size={14} className="mr-1.5" /> : <Eye size={14} className="mr-1.5" />}
          {showDetails ? 'Скрыть' : 'Показать'}
        </Button>
        <Button size="sm" variant="secondary" className="flex-1" onClick={handleFreezeToggle}>
          {isFrozen ? (
            <><Play size={14} className="mr-1.5" /> Разморозить</>
          ) : (
            <><Snowflake size={14} className="mr-1.5" /> Заморозить</>
          )}
        </Button>
        <Button size="sm" variant="secondary" className="flex-1">
          <Settings size={14} className="mr-1.5" /> PIN
        </Button>
      </div>

      {/* Spending */}
      <Card className="mb-4">
        <h3 className="text-card-title text-atlas-text mb-3">Расходы за месяц</h3>
        <div className="flex items-end justify-between mb-2">
          <span className="text-section text-atlas-text font-bold">
            {formatCurrency(card.spent, card.currency)}
          </span>
          <span className="text-label text-atlas-muted">
            из {formatCurrency(card.monthlyLimit, card.currency)}
          </span>
        </div>
        <div className="h-2 bg-atlas-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-atlas-accent rounded-full transition-all"
            style={{ width: `${(card.spent / card.monthlyLimit) * 100}%` }}
          />
        </div>
      </Card>

      {/* Limits */}
      <Card className="mb-4">
        <h3 className="text-card-title text-atlas-text mb-3">Лимиты</h3>
        <div className="space-y-3">
          {[
            { label: 'На операцию', value: card.transactionLimit },
            { label: 'Дневной', value: card.dailyLimit },
            { label: 'Месячный', value: card.monthlyLimit },
          ].map((limit) => (
            <div key={limit.label} className="flex items-center justify-between">
              <span className="text-secondary text-atlas-text-secondary">{limit.label}</span>
              <span className="text-secondary text-atlas-text font-medium">
                {formatCurrency(limit.value, card.currency)}
              </span>
            </div>
          ))}
        </div>
        <Button size="sm" variant="ghost" className="w-full mt-3">
          Изменить лимиты
        </Button>
      </Card>

      {/* Controls */}
      <Card>
        <h3 className="text-card-title text-atlas-text mb-1">Управление</h3>
        <div className="divide-y divide-white/5">
          <ControlToggle label="Онлайн-платежи" icon={Globe} enabled={card.controls.online} onToggle={() => handleControlToggle('online')} />
          <ControlToggle label="Бесконтактная оплата" icon={Wifi} enabled={card.controls.contactless} onToggle={() => handleControlToggle('contactless')} />
          <ControlToggle label="Снятие наличных" icon={Banknote} enabled={card.controls.atm} onToggle={() => handleControlToggle('atm')} />
          <ControlToggle label="Международные платежи" icon={Globe} enabled={card.controls.international} onToggle={() => handleControlToggle('international')} />
          <ControlToggle label="Подписки" icon={ShoppingBag} enabled={card.controls.subscriptions} onToggle={() => handleControlToggle('subscriptions')} />
        </div>
      </Card>
    </AppShell>
  );
}
