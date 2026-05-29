'use client';

import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDataStore } from '@/store/data';
import { useToast } from '@/components/ui/Toast';
import { ArrowDownUp, RefreshCw } from 'lucide-react';

// Hardcoded rates to RUB (base currency)
const ratesToRub: Record<string, number> = {
  RUB: 1,
  USD: 92.5,
  EUR: 100.3,
  GBP: 116.8,
  AED: 25.2,
  BTC: 9_300_000,
  ETH: 300_000,
  TON: 300,
  SOL: 15_000,
  USDT: 92,
  USDC: 92,
};

interface Asset {
  code: string;
  name: string;
  balance: number;
  rate: number;
  isCrypto: boolean;
}

export default function ExchangePage() {
  const { accounts, wallets, executeExchange } = useDataStore();
  const { toast } = useToast();

  const [fromAsset, setFromAsset] = useState('RUB');
  const [toAsset, setToAsset] = useState('USD');
  const [amount, setAmount] = useState('');
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);
  const [loading, setLoading] = useState(false);

  // Build unified asset list from store accounts + wallets
  const assets: Asset[] = useMemo(() => {
    const fiatNames: Record<string, string> = {
      RUB: 'Рубль',
      USD: 'Доллар',
      EUR: 'Евро',
      GBP: 'Фунт',
      AED: 'Дирхам',
    };

    const fiatAssets: Asset[] = accounts.map((a) => ({
      code: a.currency,
      name: fiatNames[a.currency] || a.currency,
      balance: a.balance,
      rate: ratesToRub[a.currency] ?? 1,
      isCrypto: false,
    }));

    const cryptoAssets: Asset[] = wallets.map((w) => ({
      code: w.asset,
      name: w.name,
      balance: w.balance,
      rate: ratesToRub[w.asset] ?? 1,
      isCrypto: true,
    }));

    return [...fiatAssets, ...cryptoAssets];
  }, [accounts, wallets]);

  const from = assets.find((a) => a.code === fromAsset);
  const to = assets.find((a) => a.code === toAsset);

  // Guard: if selected assets not found, fall back gracefully
  if (!from || !to) {
    return (
      <AppShell>
        <h1 className="text-header text-atlas-text mb-6">Обмен</h1>
        <Card>
          <p className="text-secondary text-atlas-muted">Нет доступных активов для обмена</p>
        </Card>
      </AppShell>
    );
  }

  const rate = from.rate / to.rate;
  const isCryptoPrecision = to.isCrypto && to.code === 'BTC';
  const receiveAmount = amount ? (Number(amount) * rate).toFixed(isCryptoPrecision ? 8 : 2) : '';

  const swap = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setAmount('');
  };

  const canExchange =
    !!amount && Number(amount) > 0 && Number(amount) <= from.balance && !loading;

  const handleExchange = () => {
    if (!canExchange) return;

    setLoading(true);
    try {
      executeExchange(fromAsset, toAsset, Number(amount), rate);
      toast(
        'success',
        `Обмен выполнен: ${Number(amount).toLocaleString('ru-RU')} ${fromAsset} → ${receiveAmount} ${toAsset}`
      );
      setAmount('');
    } catch {
      toast('error', 'Ошибка при обмене. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
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
            {assets
              .filter((a) => a.code !== toAsset)
              .map((a) => (
                <button
                  key={a.code}
                  onClick={() => {
                    setFromAsset(a.code);
                    setShowFromList(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-secondary text-atlas-text">
                    {a.code} — {a.name}
                  </span>
                  <span className="text-label text-atlas-muted">
                    {a.balance.toLocaleString('ru-RU')}
                  </span>
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
            {assets
              .filter((a) => a.code !== fromAsset)
              .map((a) => (
                <button
                  key={a.code}
                  onClick={() => {
                    setToAsset(a.code);
                    setShowToList(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-secondary text-atlas-text">
                    {a.code} — {a.name}
                  </span>
                  <span className="text-label text-atlas-muted">
                    {a.balance.toLocaleString('ru-RU')}
                  </span>
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
        disabled={!canExchange}
        onClick={handleExchange}
      >
        {loading ? 'Обмен...' : 'Обменять'}
      </Button>
    </AppShell>
  );
}
