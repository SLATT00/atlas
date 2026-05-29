'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const mockAlerts = [
  { id: 'F-001', user: 'user_8291', type: 'Account Takeover', score: 92, status: 'blocked', amount: '₽450,000', time: '2 мин назад' },
  { id: 'F-002', user: 'user_4401', type: 'Velocity', score: 78, status: 'review', amount: '₽120,000', time: '15 мин назад' },
  { id: 'F-003', user: 'user_9102', type: 'Impossible Travel', score: 85, status: 'blocked', amount: '$5,200', time: '32 мин назад' },
  { id: 'F-004', user: 'user_2203', type: 'Device Spoofing', score: 65, status: 'review', amount: '₽80,000', time: '1 час назад' },
  { id: 'F-005', user: 'user_5512', type: 'Brute Force', score: 55, status: 'approved', amount: '—', time: '2 часа назад' },
];

export default function FraudPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-header text-atlas-text">Фрод-мониторинг</h1>
        <Badge variant="error">5 алертов</Badge>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-label text-atlas-muted">Заблокировано сегодня</p>
          <p className="text-section text-atlas-error font-bold mt-1">12</p>
        </Card>
        <Card>
          <p className="text-label text-atlas-muted">На проверке</p>
          <p className="text-section text-atlas-warning font-bold mt-1">8</p>
        </Card>
        <Card>
          <p className="text-label text-atlas-muted">Предотвращённый ущерб</p>
          <p className="text-section text-atlas-success font-bold mt-1">₽2.1M</p>
        </Card>
        <Card>
          <p className="text-label text-atlas-muted">False positive rate</p>
          <p className="text-section text-atlas-text font-bold mt-1">3.2%</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-card-title text-atlas-text mb-4">Алерты</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">ID</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Пользователь</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Тип</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Скор</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Статус</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Сумма</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Время</th>
                <th className="text-label text-atlas-muted py-3 px-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {mockAlerts.map((alert) => (
                <tr key={alert.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 text-secondary text-atlas-text font-mono">{alert.id}</td>
                  <td className="py-3 px-3 text-secondary text-atlas-text">{alert.user}</td>
                  <td className="py-3 px-3 text-secondary text-atlas-text-secondary">{alert.type}</td>
                  <td className="py-3 px-3">
                    <span className={`text-secondary font-bold ${alert.score >= 80 ? 'text-atlas-error' : alert.score >= 60 ? 'text-atlas-warning' : 'text-atlas-text'}`}>
                      {alert.score}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={alert.status === 'blocked' ? 'error' : alert.status === 'review' ? 'warning' : 'success'}>
                      {alert.status === 'blocked' ? 'Заблокирован' : alert.status === 'review' ? 'Проверка' : 'Одобрен'}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-secondary text-atlas-text">{alert.amount}</td>
                  <td className="py-3 px-3 text-label text-atlas-muted">{alert.time}</td>
                  <td className="py-3 px-3">
                    <Button size="sm" variant="ghost">Детали</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
