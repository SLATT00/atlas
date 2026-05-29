'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/format';
import { useDataStore } from '@/store/data';
import { Plus, ChevronRight } from 'lucide-react';

const currencyFlags: Record<string, string> = {
  RUB: '🇷🇺',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  AED: '🇦🇪',
};

const RATES: Record<string, number> = { RUB: 1, USD: 92, EUR: 100, GBP: 116, AED: 25 };

export default function AccountsPage() {
  const accounts = useDataStore((s) => s.accounts);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, acc) => sum + acc.balance * (RATES[acc.currency] || 1), 0),
    [accounts]
  );

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-header text-atlas-text">Счета</h1>
          <p className="text-secondary text-atlas-text-secondary mt-0.5">
            Всего: {formatCurrency(totalBalance, 'RUB')}
          </p>
        </div>
        <Button size="sm" variant="secondary">
          <Plus size={16} className="mr-1.5" />
          Открыть
        </Button>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => (
          <Link key={account.id} href={`/accounts/${account.id}`}>
            <Card hoverable className="mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-atlas-elevated flex items-center justify-center text-lg">
                    {currencyFlags[account.currency] || '💰'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-body text-atlas-text font-semibold">
                        {account.currency} счёт
                      </p>
                      <Badge variant={account.status === 'active' ? 'success' : 'warning'}>
                        {account.status === 'active' ? 'Активен' : account.status}
                      </Badge>
                    </div>
                    <p className="text-label text-atlas-muted">{account.number}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-body text-atlas-text font-semibold">
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                    <p className="text-label text-atlas-muted">
                      Доступно: {formatCurrency(account.available, account.currency)}
                    </p>
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
