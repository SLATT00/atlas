'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/format';
import { ArrowDownUp, RefreshCw } from 'lucide-react';

const assets = [
  { code: 'RUB', name: 'Рубль', balance: 8_450_000, rate: 1 },
  { code: 'USD', name: 'Доллар', balance: 12_500, rate: 92.5 },
  { code: 'EUR', name: 'Евро', balance: 8_200, rate: 100.3 },
  { code: 'GBP', name: 'Фунт', balance: 0, rate: 116.8 },
  { code: 'AED', name: 'Дирхам', balance: 45_000, rate: 25.2 },
  { code: 'BTC', name: 'Bitcoin', balance: 0.4521, rate: 9_300_000 },
  { code: 'ETH', name: 'Ethereum', balance: 3.2, rate: 300_000 },
  { code: 'TON', name: 'Toncoin', balance: 1500, rate: 300 },
  { code: 'USDT', name: 'Tether', balance: 5000, rate: 92 },
  { code: 'USDC', name: 'USD Coin', balance: 3000, rate: 92 },
];

export default function ExchangePage() {
  const [fromAsset, setFromAsset] = useState('RUB');
  const [toAsset, setToAsset] = useState('USD');
  const [amount, setAmount] = useState('');
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);

  const from = assets.find((a) => a.code === fromAsset)!;
  const to = assets.find((a) => a.code === toAsset)!;

  const rate = from.rate / to.rate;
  const receiveAmount = amount ? (Number(amount) * rate).toFixed(to.code === 'BTC' ? 8 : 2) : '';

  const swap = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setAmount('');
  };

  return (
    <AppShell>
      <h1 className="text-header text-atlas-text mb-6">Обмен</h1>

      {/* From */}
      <Card className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-secondary text-atlas-text-secondary">Отдаёте</span>
          <span className="text-label text-atlas-muted">
            Баланс: {from.balance.toLocaleString('ru-RU')} {from.code}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFromList(!showFromList)}
            className="flex items-center gap-2 px-3 py-2 bg-atlas-elevated rounded-xl border border-white/10 hover:border-white/20 transition-colors"
          >
            <span className="text-body text-atlas-text font-semibold">{fromAsset}</span>
            <svg className="w-4 h-4 text-atlas-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent text-right text-section text-atlas-text font-semibold outline-none placeholder:text-atlas-muted"
          />
        </div>
        {showFromList && (
          <div className="mt-3 p-2 bg-atlas-elevated rounded-xl border border-white/10 max-h-48 overflow-y-auto">
            {assets.filter((a) => a.code !== toAsset).map((a) => (
              <button
                key={a.code}
                onClick={() => { setFromAsset(a.code); setShowFromList(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="text-secondary text-atlas-text">{a.code} — {a.name}</span>
                <span className="text-label text-atlas-muted">{a.balance}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Swap Button */}
      <div className="flex justify-center -my-3 relative z-10">
        <button
          onClick={swap}
          className="w-10 h-10 rounded-full bg-atlas-card border border-white/10 flex items-center justify-center hover:bg-atlas-elevated transition-colors"
        >
          <ArrowDownUp size={18} className="text-atlas-accent" />
        </button>
      </div>

      {/* To */}
      <Card className="mt-2 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-secondary text-atlas-text-secondary">Получаете</span>
          <span className="text-label text-atlas-muted">
            Баланс: {to.balance.toLocaleString('ru-RU')} {to.code}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowToList(!showToList)}
            className="flex items-center gap-2 px-3 py-2 bg-atlas-elevated rounded-xl border border-white/10 hover:border-white/20 transition-colors"
          >
            <span className="text-body text-atlas-text font-semibold">{toAsset}</span>
            <svg className="w-4 h-4 text-atlas-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="flex-1 text-right text-section text-atlas-text font-semibold">
            {receiveAmount || '0.00'}
          </div>
        </div>
        {showToList && (
          <div className="mt-3 p-2 bg-atlas-elevated rounded-xl border border-white/10 max-h-48 overflow-y-auto">
            {assets.filter((a) => a.code !== fromAsset).map((a) => (
              <button
                key={a.code}
                onClick={() => { setToAsset(a.code); setShowToList(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="text-secondary text-atlas-text">{a.code} — {a.name}</span>
                <span className="text-label text-atlas-muted">{a.balance}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Rate Info */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-atlas-accent" />
            <span className="text-secondary text-atlas-text-secondary">Курс</span>
          </div>
          <span className="text-secondary text-atlas-text">
            1 {fromAsset} = {rate < 0.001 ? rate.toFixed(8) : rate.toFixed(2)} {toAsset}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-secondary text-atlas-text-secondary">Комиссия</span>
          <span className="text-secondary text-atlas-success">0.1%</span>
        </div>
      </Card>

      <Button
        className="w-full"
        size="lg"
        disabled={!amount || Number(amount) <= 0 || Number(amount) > from.balance}
      >
        Обменять
      </Button>
    </AppShell>
  );
}
