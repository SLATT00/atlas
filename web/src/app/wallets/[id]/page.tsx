'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDataStore } from '@/store/data';
import { formatDate } from '@/lib/format';
import {
  ChevronLeft,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';

const PRICES: Record<string, number> = { BTC: 9_200_000, ETH: 340_000, TON: 550, SOL: 15_000, USDT: 92, USDC: 92 };

export default function WalletDetailPage() {
  const { id } = useParams();
  const walletId = typeof id === 'string' ? id : id?.[0] ?? '';

  const wallets = useDataStore((s) => s.wallets);
  const walletTxs = useDataStore((s) => s.walletTxs);

  const wallet = wallets.find((w) => w.id === walletId);
  const txs = useMemo(
    () => walletTxs.filter((t) => t.walletId === walletId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [walletTxs, walletId]
  );

  const [showQR, setShowQR] = useState(false);

  if (!wallet) {
    return (
      <AppShell>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/wallets" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <ChevronLeft size={20} className="text-atlas-text-secondary" />
          </Link>
          <h1 className="text-section text-atlas-text">Кошелёк не найден</h1>
        </div>
      </AppShell>
    );
  }

  const valueRub = wallet.balance * (PRICES[wallet.asset] || 0);

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/wallets" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <div>
          <h1 className="text-section text-atlas-text">{wallet.name}</h1>
          <p className="text-label text-atlas-muted">{wallet.network}</p>
        </div>
      </div>

      <Card className="mb-4 text-center">
        <p className="text-hero text-atlas-text">{wallet.balance} {wallet.asset}</p>
        <p className="text-secondary text-atlas-text-secondary mt-1">
          ≈ ₽{valueRub.toLocaleString('ru-RU')}
        </p>
        <div className="flex gap-2 mt-5">
          <Button size="sm" className="flex-1">
            <ArrowDownLeft size={14} className="mr-1.5" /> Получить
          </Button>
          <Link href="/transfers/new" className="flex-1">
            <Button size="sm" variant="secondary" className="w-full">
              <ArrowUpRight size={14} className="mr-1.5" /> Отправить
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-card-title text-atlas-text">Адрес</h3>
          <button onClick={() => setShowQR(!showQR)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <QrCode size={18} className="text-atlas-accent" />
          </button>
        </div>

        {showQR && (
          <div className="bg-white rounded-xl p-4 mb-3 flex items-center justify-center">
            <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-label">
              QR Code
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 p-3 bg-atlas-bg rounded-xl">
          <p className="text-label text-atlas-text font-mono flex-1 break-all">{wallet.address}</p>
          <button
            onClick={() => navigator.clipboard.writeText(wallet.address)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors shrink-0"
          >
            <Copy size={14} className="text-atlas-accent" />
          </button>
        </div>
      </Card>

      <h2 className="text-card-title text-atlas-text mb-3">Транзакции</h2>
      {txs.length === 0 ? (
        <p className="text-secondary text-atlas-muted text-center py-8">Нет транзакций</p>
      ) : (
        <div className="space-y-1">
          {txs.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-atlas-card border border-white/10 flex items-center justify-center">
                  {tx.direction === 'in' ? (
                    <ArrowDownLeft size={16} className="text-atlas-success" />
                  ) : (
                    <ArrowUpRight size={16} className="text-atlas-text-secondary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-secondary text-atlas-text font-mono">{tx.txHash}</p>
                    <ExternalLink size={12} className="text-atlas-muted" />
                  </div>
                  <p className="text-label text-atlas-muted">{formatDate(tx.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-secondary font-medium ${tx.direction === 'in' ? 'text-atlas-success' : 'text-atlas-text'}`}>
                  {tx.direction === 'in' ? '+' : '-'}{tx.amount} {wallet.asset}
                </p>
                <Badge variant={tx.status === 'confirmed' ? 'success' : 'warning'}>
                  {tx.status === 'confirmed' ? `${tx.confirmations} подтв.` : 'Ожидание'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
