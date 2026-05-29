'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/format';
import {
  ChevronLeft,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Copy,
  ExternalLink,
} from 'lucide-react';

const mockWallet = {
  id: '1',
  asset: 'BTC',
  name: 'Bitcoin',
  network: 'bitcoin',
  balance: 0.4521,
  address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  valueRub: 4_200_000,
};

const mockTxs = [
  { id: '1', direction: 'in' as const, amount: 0.1, txHash: '3a1b2c...f8e9d0', confirmations: 6, status: 'confirmed', date: '2026-05-28T14:00:00Z' },
  { id: '2', direction: 'out' as const, amount: 0.05, txHash: '7d8e9f...a1b2c3', confirmations: 3, status: 'confirmed', date: '2026-05-25T10:30:00Z' },
  { id: '3', direction: 'in' as const, amount: 0.2, txHash: '4e5f6a...b7c8d9', confirmations: 100, status: 'confirmed', date: '2026-05-20T08:15:00Z' },
  { id: '4', direction: 'out' as const, amount: 0.01, txHash: '9a0b1c...d2e3f4', confirmations: 0, status: 'pending', date: '2026-05-29T16:00:00Z' },
];

export default function WalletDetailPage() {
  const { id } = useParams();
  const [showQR, setShowQR] = useState(false);

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/wallets" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <div>
          <h1 className="text-section text-atlas-text">{mockWallet.name}</h1>
          <p className="text-label text-atlas-muted">{mockWallet.network}</p>
        </div>
      </div>

      {/* Balance */}
      <Card className="mb-4 text-center">
        <p className="text-hero text-atlas-text">{mockWallet.balance} {mockWallet.asset}</p>
        <p className="text-secondary text-atlas-text-secondary mt-1">
          ≈ ₽{mockWallet.valueRub.toLocaleString('ru-RU')}
        </p>

        <div className="flex gap-2 mt-5">
          <Button size="sm" className="flex-1">
            <ArrowDownLeft size={14} className="mr-1.5" /> Получить
          </Button>
          <Button size="sm" variant="secondary" className="flex-1">
            <ArrowUpRight size={14} className="mr-1.5" /> Отправить
          </Button>
        </div>
      </Card>

      {/* Address */}
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
          <p className="text-label text-atlas-text font-mono flex-1 break-all">{mockWallet.address}</p>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors shrink-0">
            <Copy size={14} className="text-atlas-accent" />
          </button>
        </div>
      </Card>

      {/* Transactions */}
      <h2 className="text-card-title text-atlas-text mb-3">Транзакции</h2>
      <div className="space-y-1">
        {mockTxs.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/5 transition-colors"
          >
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
                {tx.direction === 'in' ? '+' : '-'}{tx.amount} {mockWallet.asset}
              </p>
              <Badge variant={tx.status === 'confirmed' ? 'success' : 'warning'}>
                {tx.status === 'confirmed' ? `${tx.confirmations} подтв.` : 'Ожидание'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
