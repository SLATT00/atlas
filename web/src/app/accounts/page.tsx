'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/format';
import { Plus, ChevronRight } from 'lucide-react';

const mockAccounts = [
  { id: '1', currency: 'RUB', type: 'checking', balance: 8_450_000, available: 8_200_000, number: '4081 7810 0000 1234', iban: '' },
  { id: '2', currency: 'USD', type: 'checking', balance: 12_500, available: 12_500, number: '4081 7840 0000 5678', iban: 'RU12 3456 7890 1234 5678 9012 345' },
  { id: '3', currency: 'EUR', type: 'checking', balance: 8_200, available: 8_200, number: '4081 7978 0000 9012', iban: 'RU98 7654 3210 9876 5432 1098 765' },
  { id: '4', currency: 'AED', type: 'checking', balance: 45_000, available: 45_000, number: '4081 7840 0000 3456', iban: '' },
];

const currencyFlags: Record<string, string> = {
  RUB: '🇷🇺',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  AED: '🇦🇪',
};

export default function AccountsPage() {
  const totalBalance = mockAccounts.reduce((sum, acc) => {
    const rates: Record<string, number> = { RUB: 1, USD: 92, EUR: 100, GBP: 116, AED: 25 };
    return sum + acc.balance * (rates[acc.currency] || 1);
  }, 0);

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
        {mockAccounts.map((account) => (
          <Card key={account.id} hoverable>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-atlas-elevated flex items-center justify-center text-lg">
                  {currencyFlags[account.currency]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-body text-atlas-text font-semibold">
                      {account.currency} счёт
                    </p>
                    <Badge variant="success">Активен</Badge>
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
        ))}
      </div>
    </AppShell>
  );
}
