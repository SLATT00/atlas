'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDataStore } from '@/store/data';
import { Plus, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

const assetIcons: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', TON: '◎', SOL: '◎', USDT: '₮', USDC: '$',
};

export default function WalletsPage() {
  const wallets = useDataStore((s) => s.wallets);

  const PRICES: Record<string, number> = { BTC: 9_200_000, ETH: 340_000, TON: 550, SOL: 15_000, USDT: 92, USDC: 92 };
  const totalValue = wallets.reduce((sum, w) => sum + w.balance * (PRICES[w.asset] || 0), 0);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-header text-atlas-text">Кошельки</h1>
          <p className="text-secondary text-atlas-text-secondary mt-0.5">
            ≈ ₽{totalValue.toLocaleString('ru-RU')}
          </p>
        </div>
        <Button size="sm" variant="secondary">
          <Plus size={16} className="mr-1.5" />
          Добавить
        </Button>
      </div>

      <div className="space-y-3">
        {wallets.map((wallet) => (
          <Link key={wallet.id} href={`/wallets/${wallet.id}`}>
            <Card hoverable className="mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-atlas-elevated flex items-center justify-center text-lg font-bold text-atlas-accent">
                    {assetIcons[wallet.asset] || wallet.asset[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-body text-atlas-text font-semibold">{wallet.asset}</p>
                      <span className="text-label text-atlas-muted">{wallet.name}</span>
                    </div>
                    <p className="text-label text-atlas-muted">{wallet.network}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-body text-atlas-text font-semibold">
                      {wallet.balance} {wallet.asset}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      {wallet.change24h >= 0 ? (
                        <TrendingUp size={12} className="text-atlas-success" />
                      ) : (
                        <TrendingDown size={12} className="text-atlas-error" />
                      )}
                      <span className={`text-label ${wallet.change24h >= 0 ? 'text-atlas-success' : 'text-atlas-error'}`}>
                        {wallet.change24h >= 0 ? '+' : ''}{wallet.change24h}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-atlas-muted" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
