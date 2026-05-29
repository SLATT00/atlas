'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDataStore } from '@/store/data';
import { formatCurrency } from '@/lib/format';
import {
  ChevronLeft,
  ArrowLeftRight,
  Building2,
  Globe,
  CreditCard,
  Bitcoin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

type TransferType = 'internal' | 'domestic' | 'international' | 'card' | 'crypto';

const transferTypes: { type: TransferType; icon: typeof ArrowLeftRight; label: string; fee: string; feeAmount: number; time: string }[] = [
  { type: 'internal', icon: ArrowLeftRight, label: 'Внутренний', fee: 'Бесплатно', feeAmount: 0, time: 'Мгновенно' },
  { type: 'domestic', icon: Building2, label: 'По стране', fee: '50 ₽', feeAmount: 50, time: '1-2 часа' },
  { type: 'international', icon: Globe, label: 'Международный', fee: '500 ₽', feeAmount: 500, time: '15-60 мин' },
  { type: 'card', icon: CreditCard, label: 'На карту', fee: '100 ₽', feeAmount: 100, time: '5-30 мин' },
  { type: 'crypto', icon: Bitcoin, label: 'Крипто', fee: 'Сетевая', feeAmount: 0, time: '10-60 мин' },
];

export default function NewTransferPage() {
  const router = useRouter();
  const { accounts, createTransfer } = useDataStore();

  const [step, setStep] = useState(1);
  const [type, setType] = useState<TransferType>('internal');
  const [form, setForm] = useState({
    sourceAccountId: accounts[0]?.id ?? '',
    recipient: '',
    amount: '',
    description: '',
  });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const selectedType = transferTypes.find((t) => t.type === type)!;
  const sourceAccount = accounts.find((a) => a.id === form.sourceAccountId);

  const amount = Number(form.amount) || 0;
  const fee = selectedType.feeAmount;
  const total = amount + fee;
  const insufficientFunds = sourceAccount ? total > sourceAccount.available : false;

  const handleConfirm = () => {
    if (!sourceAccount) return;

    if (insufficientFunds) {
      setError('Недостаточно средств на счёте');
      return;
    }

    createTransfer({
      recipient: form.recipient,
      amount,
      currency: sourceAccount.currency,
      type: selectedType.label,
      fee,
    });

    setConfirmed(true);
    setTimeout(() => router.push('/transfers'), 2000);
  };

  if (confirmed) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-atlas-success/15 flex items-center justify-center mb-4">
            <CheckCircle2 size={40} className="text-atlas-success" />
          </div>
          <h1 className="text-header text-atlas-text mb-2">Перевод отправлен</h1>
          <p className="text-secondary text-atlas-text-secondary mb-1">
            {sourceAccount ? formatCurrency(amount, sourceAccount.currency) : amount} &rarr; {form.recipient}
          </p>
          <p className="text-label text-atlas-muted">
            Ожидаемое время: {selectedType.time}
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/transfers" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <h1 className="text-section text-atlas-text">Новый перевод</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${step >= s ? 'bg-atlas-accent' : 'bg-atlas-card'}`} />
        ))}
      </div>

      {/* Step 1: Type */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-secondary text-atlas-text-secondary mb-2">Тип перевода</p>
          {transferTypes.map(({ type: t, icon: Icon, label, fee: feeLabel, time }) => (
            <button
              key={t}
              onClick={() => { setType(t); setStep(2); }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                type === t ? 'bg-atlas-accent/10 border-atlas-accent/30' : 'bg-atlas-card border-white/5 hover:border-white/10'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-atlas-elevated flex items-center justify-center">
                <Icon size={18} className="text-atlas-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-body text-atlas-text font-medium">{label}</p>
                <p className="text-label text-atlas-muted">{feeLabel} &middot; {time}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <p className="text-secondary text-atlas-text-secondary mb-2">Откуда</p>
            <div className="space-y-2">
              {accounts
                .filter((acc) => acc.status === 'active')
                .map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => { setForm({ ...form, sourceAccountId: acc.id }); setError(''); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    form.sourceAccountId === acc.id ? 'bg-atlas-accent/10 border-atlas-accent/30' : 'bg-atlas-card border-white/5'
                  }`}
                >
                  <span className="text-secondary text-atlas-text">{acc.currency} счёт</span>
                  <span className="text-secondary text-atlas-text-secondary">
                    {formatCurrency(acc.available, acc.currency)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Получатель"
            placeholder={type === 'crypto' ? 'Адрес кошелька' : 'Имя, телефон или реквизиты'}
            value={form.recipient}
            onChange={(e) => setForm({ ...form, recipient: e.target.value })}
          />

          <Input
            label="Сумма"
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => { setForm({ ...form, amount: e.target.value }); setError(''); }}
          />

          {fee > 0 && amount > 0 && (
            <p className="text-label text-atlas-muted">
              Комиссия: {selectedType.fee} &middot; Итого: {sourceAccount ? formatCurrency(total, sourceAccount.currency) : total}
            </p>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-atlas-error/10 border border-atlas-error/20">
              <AlertCircle size={16} className="text-atlas-error mt-0.5 shrink-0" />
              <p className="text-label text-atlas-error">{error}</p>
            </div>
          )}

          <Input
            label="Описание"
            placeholder="Назначение (необязательно)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" size="lg" onClick={() => setStep(1)}>
              Назад
            </Button>
            <Button
              className="flex-1"
              size="lg"
              onClick={() => {
                if (insufficientFunds) {
                  setError('Недостаточно средств на счёте');
                  return;
                }
                setStep(3);
              }}
              disabled={!form.recipient || !form.amount || amount <= 0}
            >
              Далее
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && sourceAccount && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-card-title text-atlas-text mb-4">Подтверждение</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary text-atlas-text-secondary">Тип</span>
                <span className="text-secondary text-atlas-text">{selectedType.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary text-atlas-text-secondary">Откуда</span>
                <span className="text-secondary text-atlas-text">{sourceAccount.currency} счёт</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary text-atlas-text-secondary">Баланс</span>
                <span className="text-secondary text-atlas-text-secondary">
                  {formatCurrency(sourceAccount.available, sourceAccount.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary text-atlas-text-secondary">Получатель</span>
                <span className="text-secondary text-atlas-text">{form.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary text-atlas-text-secondary">Сумма</span>
                <span className="text-secondary text-atlas-text font-semibold">
                  {formatCurrency(amount, sourceAccount.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary text-atlas-text-secondary">Комиссия</span>
                <span className="text-secondary text-atlas-text">{selectedType.fee}</span>
              </div>
              {fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-secondary text-atlas-text-secondary">Итого</span>
                  <span className="text-secondary text-atlas-text font-semibold">
                    {formatCurrency(total, sourceAccount.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-white/5">
                <span className="text-secondary text-atlas-text-secondary">Время доставки</span>
                <span className="text-secondary text-atlas-accent">{selectedType.time}</span>
              </div>
            </div>
          </Card>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-atlas-warning/10 border border-atlas-warning/20">
            <AlertCircle size={16} className="text-atlas-warning mt-0.5 shrink-0" />
            <p className="text-label text-atlas-warning">
              Проверьте данные перевода. После подтверждения операция будет выполнена.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-atlas-error/10 border border-atlas-error/20">
              <AlertCircle size={16} className="text-atlas-error mt-0.5 shrink-0" />
              <p className="text-label text-atlas-error">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" size="lg" onClick={() => setStep(2)}>
              Назад
            </Button>
            <Button className="flex-1" size="lg" onClick={handleConfirm}>
              Подтвердить
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
