'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/format';
import { Users, CreditCard, ArrowLeftRight, AlertTriangle, TrendingUp, Shield } from 'lucide-react';

const stats = [
  { label: 'Пользователи', value: '124,531', change: '+2.4%', icon: Users, color: 'text-atlas-accent' },
  { label: 'Активные карты', value: '89,204', change: '+1.8%', icon: CreditCard, color: 'text-atlas-success' },
  { label: 'Переводы сегодня', value: '45,892', change: '+12.3%', icon: ArrowLeftRight, color: 'text-purple-400' },
  { label: 'Фрод-алерты', value: '23', change: '-5.1%', icon: AlertTriangle, color: 'text-atlas-warning' },
  { label: 'Оборот (день)', value: formatCurrency(2_450_000_000, 'RUB'), change: '+8.7%', icon: TrendingUp, color: 'text-atlas-success' },
  { label: 'KYC на проверке', value: '156', change: '+3', icon: Shield, color: 'text-atlas-accent' },
];

const recentAlerts = [
  { id: '1', type: 'fraud', message: 'Подозрительная активность: user_8291', severity: 'high', time: '2 мин назад' },
  { id: '2', type: 'compliance', message: 'PEP match: user_1204', severity: 'medium', time: '15 мин назад' },
  { id: '3', type: 'system', message: 'Transfer service latency spike (p99 > 2s)', severity: 'medium', time: '23 мин назад' },
  { id: '4', type: 'fraud', message: 'Множественные неудачные входы: user_5512', severity: 'low', time: '1 час назад' },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-header text-atlas-text mb-6">Дашборд</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-label text-atlas-muted mb-1">{stat.label}</p>
                  <p className="text-section text-atlas-text font-bold">{stat.value}</p>
                  <p className={`text-label mt-1 ${stat.change.startsWith('+') ? 'text-atlas-success' : 'text-atlas-error'}`}>
                    {stat.change}
                  </p>
                </div>
                <Icon size={20} className={stat.color} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Alerts */}
      <Card>
        <h2 className="text-card-title text-atlas-text mb-4">Последние алерты</h2>
        <div className="space-y-3">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <Badge variant={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'neutral'}>
                  {alert.severity}
                </Badge>
                <span className="text-secondary text-atlas-text">{alert.message}</span>
              </div>
              <span className="text-label text-atlas-muted">{alert.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
