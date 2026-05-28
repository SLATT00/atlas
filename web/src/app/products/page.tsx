'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/format';
import { TrendingUp, Landmark, ChevronRight } from 'lucide-react';

const savingsProducts = [
  { id: '1', name: 'RUB Вклад', currency: 'RUB', balance: 500000, apy: 18.5, status: 'active' },
  { id: '2', name: 'USD Вклад', currency: 'USD', balance: 5000, apy: 5.2, status: 'active' },
  { id: '3', name: 'USDT Стейкинг', currency: 'USDT', balance: 10000, apy: 8.0, status: 'active' },
];

const loanProducts = [
  { id: '1', collateral: 'BTC', amount: 2000000, currency: 'RUB', ltv: 45, rate: 12.5, status: 'active' },
  { id: '2', collateral: 'ETH', amount: 500000, currency: 'RUB', ltv: 52, rate: 13.0, status: 'active' },
];

export default function ProductsPage() {
  return (
    <AppShell>
      <h1 className="text-header text-atlas-text mb-6">Продукты</h1>

      {/* Savings Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-atlas-success" />
            <h2 className="text-section text-atlas-text">Накопления</h2>
          </div>
          <Button size="sm" variant="ghost">Открыть вклад</Button>
        </div>

        <div className="space-y-3">
          {savingsProducts.map((product) => (
            <Card key={product.id} hoverable>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body text-atlas-text font-semibold">{product.name}</p>
                  <p className="text-label text-atlas-muted mt-0.5">
                    APY: <span className="text-atlas-success">{product.apy}%</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-body text-atlas-text font-semibold">
                      {formatCurrency(product.balance, product.currency)}
                    </p>
                    <p className="text-label text-atlas-success">
                      +{formatCurrency(product.balance * product.apy / 100 / 365, product.currency)}/день
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-atlas-muted" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Loans Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Landmark size={20} className="text-purple-400" />
            <h2 className="text-section text-atlas-text">Займы</h2>
          </div>
          <Button size="sm" variant="ghost">Оформить займ</Button>
        </div>

        <div className="space-y-3">
          {loanProducts.map((loan) => (
            <Card key={loan.id} hoverable>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-body text-atlas-text font-semibold">
                      Залог: {loan.collateral}
                    </p>
                    <Badge variant={loan.ltv < 50 ? 'success' : 'warning'}>
                      {`LTV ${loan.ltv}%`}
                    </Badge>
                  </div>
                  <p className="text-label text-atlas-muted mt-0.5">
                    Ставка: {loan.rate}% годовых
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-body text-atlas-text font-semibold">
                    {formatCurrency(loan.amount, loan.currency)}
                  </p>
                  <ChevronRight size={18} className="text-atlas-muted" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Available Credit */}
        <Card className="mt-4 border-atlas-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-atlas-text-secondary">Доступный кредит</p>
              <p className="text-section text-atlas-text font-bold mt-1">
                {formatCurrency(5_000_000, 'RUB')}
              </p>
            </div>
            <Button size="sm">Получить</Button>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
