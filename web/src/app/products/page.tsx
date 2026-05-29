'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/format';
import { useDataStore } from '@/store/data';
import { useToast } from '@/components/ui/Toast';
import { TrendingUp, Landmark, ChevronRight } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const savings = useDataStore((s) => s.savings);
  const loans = useDataStore((s) => s.loans);
  const repayLoan = useDataStore((s) => s.repayLoan);

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
        </div>

        {savings.length === 0 ? (
          <Card>
            <p className="text-secondary text-atlas-muted text-center py-6">Нет активных вкладов</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {savings.map((product) => (
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
        )}
      </section>

      {/* Loans Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Landmark size={20} className="text-purple-400" />
            <h2 className="text-section text-atlas-text">Займы</h2>
          </div>
        </div>

        {loans.length === 0 ? (
          <Card>
            <p className="text-secondary text-atlas-muted text-center py-6">Нет активных займов</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => (
              <Card key={loan.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-body text-atlas-text font-semibold">
                      Залог: {loan.collateral}
                    </p>
                    <Badge variant={loan.ltv < 50 ? 'success' : 'warning'}>
                      {`LTV ${loan.ltv}%`}
                    </Badge>
                    <Badge variant={loan.status === 'active' ? 'info' : 'success'}>
                      {loan.status === 'active' ? 'Активен' : 'Закрыт'}
                    </Badge>
                  </div>
                  <p className="text-body text-atlas-text font-semibold">
                    {formatCurrency(loan.amount, loan.currency)}
                  </p>
                </div>
                <p className="text-label text-atlas-muted mb-3">
                  Ставка: {loan.rate}% годовых
                </p>
                {loan.status === 'active' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      repayLoan(loan.id, Math.min(50000, loan.amount));
                      toast('success', `Погашено ${formatCurrency(Math.min(50000, loan.amount), loan.currency)}`);
                    }}
                  >
                    Погасить ₽50 000
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
