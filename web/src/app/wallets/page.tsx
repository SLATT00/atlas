'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/format';
import { Plus, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

const mockWallets = [
  { id: '1', asset: 'BTC', name: 'Bitcoin', network: 'bitcoin', balance: 0.4521, valueRub: 4_200_000, change24h: 2.4 },
  { id: '2', asset: 'ETH', name: 'Ethereum', network: 'ethereum', balance: 3.2, valueRub: 960_000, change24h: -1.2 },
  { id: '3', asset: 'TON', name: 'Toncoin', network: 'ton', balance: 1500, valueRub: 450_000, change24h: 5.1 },
  { id: '4', asset: 'SOL', name: 'Solana', network: 'solana', balance: 25, valueRub: 375_000, change24h: 3.8 },
  { id: '5', asset: 'USDT', name: 'Tether', network: 'ethereum', balance: 5000, valueRub: 460_000, change24h: 0.01 },
  { id: '6', asset: 'USDC', name: 'USD Coin', network: 'ethereum', balance: 3000, valueRub: 276_000, change24h: -0.02 },
];

const assetIcons: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  TON: '◎',
  SOL: '◎',
  USDT: '₮',
  USDC: '$',
};

export default function WalletsPage() {
  const totalValue = mockWallets.reduce((sum, w) => sum + w.valueRub, 0);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-header text-atlas-text">Кошельки</h1>
          <p className="text-secondary text-atlas-text-secondary mt-0.5">
            {formatCurrency(totalValue, 'RUB')}
          </p>
        </div>
        <Button size="sm" variant="secondary">
          <Plus size={16} className="mr-1.5" />
          Добавить
        </Button>
      </div>

      <div className="space-y-3">
        {mockWallets.map((wallet) => (
          <Link key={wallet.id} href={`/wallets/${wallet.id}`}>
            <Card hoverable className="mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-atlas-elevated flex items-center justify-center text-lg font-bold text-atlas-accent">
                    {assetIcons[wallet.asset]}
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
