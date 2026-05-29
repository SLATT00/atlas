'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
} from 'lucide-react';

const mockCard = {
  id: '1',
  type: 'metal',
  typeName: 'Atlas Metal',
  last4: '4829',
  network: 'Visa',
  status: 'active' as const,
  currency: 'RUB',
  spent: 145000,
  dailyLimit: 500000,
  monthlyLimit: 5000000,
  transactionLimit: 200000,
  expiryMonth: 12,
  expiryYear: 2028,
  holder: 'MIKHAIL IVANOV',
};

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
  const [showDetails, setShowDetails] = useState(false);
  const [controls, setControls] = useState({
    online: true,
    contactless: true,
    atm: true,
    international: true,
    subscriptions: true,
  });

  const toggleControl = (key: keyof typeof controls) => {
    setControls((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/cards" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <div className="flex-1">
          <h1 className="text-section text-atlas-text">{mockCard.typeName}</h1>
          <p className="text-label text-atlas-muted">{mockCard.network} •••• {mockCard.last4}</p>
        </div>
        <Badge variant="success">Активна</Badge>
      </div>

      {/* Card Visual */}
      <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-2xl p-5 border border-white/10 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center justify-between mb-10">
            <span className="text-secondary text-atlas-text font-semibold">{mockCard.typeName}</span>
            <CreditCard size={24} className="text-atlas-text-secondary" />
          </div>
          <p className="text-section text-atlas-text tracking-[0.2em] mb-4 font-mono">
            {showDetails ? '4276 8901 2345 ' + mockCard.last4 : '•••• •••• •••• ' + mockCard.last4}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label text-atlas-muted">Держатель</p>
              <p className="text-secondary text-atlas-text">{mockCard.holder}</p>
            </div>
            <div className="text-right">
              <p className="text-label text-atlas-muted">Срок</p>
              <p className="text-secondary text-atlas-text">
                {String(mockCard.expiryMonth).padStart(2, '0')}/{mockCard.expiryYear}
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
        <Button size="sm" variant="secondary" className="flex-1">
          <Snowflake size={14} className="mr-1.5" /> Заморозить
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
            {formatCurrency(mockCard.spent, mockCard.currency)}
          </span>
          <span className="text-label text-atlas-muted">
            из {formatCurrency(mockCard.monthlyLimit, mockCard.currency)}
          </span>
        </div>
        <div className="h-2 bg-atlas-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-atlas-accent rounded-full transition-all"
            style={{ width: `${(mockCard.spent / mockCard.monthlyLimit) * 100}%` }}
          />
        </div>
      </Card>

      {/* Limits */}
      <Card className="mb-4">
        <h3 className="text-card-title text-atlas-text mb-3">Лимиты</h3>
        <div className="space-y-3">
          {[
            { label: 'На операцию', value: mockCard.transactionLimit },
            { label: 'Дневной', value: mockCard.dailyLimit },
            { label: 'Месячный', value: mockCard.monthlyLimit },
          ].map((limit) => (
            <div key={limit.label} className="flex items-center justify-between">
              <span className="text-secondary text-atlas-text-secondary">{limit.label}</span>
              <span className="text-secondary text-atlas-text font-medium">
                {formatCurrency(limit.value, mockCard.currency)}
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
          <ControlToggle label="Онлайн-платежи" icon={Globe} enabled={controls.online} onToggle={() => toggleControl('online')} />
          <ControlToggle label="Бесконтактная оплата" icon={Wifi} enabled={controls.contactless} onToggle={() => toggleControl('contactless')} />
          <ControlToggle label="Снятие наличных" icon={Banknote} enabled={controls.atm} onToggle={() => toggleControl('atm')} />
          <ControlToggle label="Международные платежи" icon={Globe} enabled={controls.international} onToggle={() => toggleControl('international')} />
          <ControlToggle label="Подписки" icon={ShoppingBag} enabled={controls.subscriptions} onToggle={() => toggleControl('subscriptions')} />
        </div>
      </Card>
    </AppShell>
  );
}
