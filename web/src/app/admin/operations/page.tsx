'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const systemHealth = [
  { service: 'API Gateway', status: 'healthy', latency: '12ms', uptime: '99.99%' },
  { service: 'Auth Service', status: 'healthy', latency: '8ms', uptime: '99.99%' },
  { service: 'Account Service', status: 'healthy', latency: '15ms', uptime: '99.98%' },
  { service: 'Transfer Service', status: 'degraded', latency: '245ms', uptime: '99.91%' },
  { service: 'Card Service', status: 'healthy', latency: '11ms', uptime: '99.99%' },
  { service: 'Wallet Service', status: 'healthy', latency: '18ms', uptime: '99.97%' },
  { service: 'Ledger Service', status: 'healthy', latency: '6ms', uptime: '100%' },
  { service: 'Notification Service', status: 'healthy', latency: '22ms', uptime: '99.95%' },
  { service: 'Loan Service', status: 'healthy', latency: '14ms', uptime: '99.99%' },
  { service: 'Exchange Service', status: 'healthy', latency: '35ms', uptime: '99.96%' },
];

const recentDeployments = [
  { service: 'transfer-service', version: 'v1.4.2', status: 'deployed', time: '10 мин назад', author: 'CI/CD' },
  { service: 'auth-service', version: 'v1.2.8', status: 'deployed', time: '2 часа назад', author: 'CI/CD' },
  { service: 'card-service', version: 'v1.1.5', status: 'deployed', time: '5 часов назад', author: 'CI/CD' },
];

export default function OperationsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-header text-atlas-text">Операции</h1>
        <Badge variant="success">Все системы работают</Badge>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-label text-atlas-muted">Сервисы</p>
          <p className="text-section text-atlas-success font-bold mt-1">16/16</p>
        </Card>
        <Card>
          <p className="text-label text-atlas-muted">Средний latency</p>
          <p className="text-section text-atlas-text font-bold mt-1">18ms</p>
        </Card>
        <Card>
          <p className="text-label text-atlas-muted">Запросов/сек</p>
          <p className="text-section text-atlas-text font-bold mt-1">12,450</p>
        </Card>
        <Card>
          <p className="text-label text-atlas-muted">Ошибки (5xx)</p>
          <p className="text-section text-atlas-success font-bold mt-1">0.02%</p>
        </Card>
      </div>

      {/* Service Health */}
      <Card className="mb-6">
        <h2 className="text-card-title text-atlas-text mb-4">Здоровье сервисов</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-label text-atlas-muted py-2 px-3 font-medium">Сервис</th>
                <th className="text-left text-label text-atlas-muted py-2 px-3 font-medium">Статус</th>
                <th className="text-left text-label text-atlas-muted py-2 px-3 font-medium">Latency</th>
                <th className="text-left text-label text-atlas-muted py-2 px-3 font-medium">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {systemHealth.map((s) => (
                <tr key={s.service} className="border-b border-white/5">
                  <td className="py-2.5 px-3 text-secondary text-atlas-text">{s.service}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={s.status === 'healthy' ? 'success' : 'warning'}>
                      {s.status === 'healthy' ? 'OK' : 'Degraded'}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-secondary text-atlas-text font-mono">{s.latency}</td>
                  <td className="py-2.5 px-3 text-secondary text-atlas-success">{s.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Deployments */}
      <Card>
        <h2 className="text-card-title text-atlas-text mb-4">Последние деплои</h2>
        <div className="space-y-3">
          {recentDeployments.map((d) => (
            <div key={d.service + d.version} className="flex items-center justify-between py-2">
              <div>
                <p className="text-secondary text-atlas-text">{d.service} <span className="text-atlas-accent font-mono">{d.version}</span></p>
                <p className="text-label text-atlas-muted">{d.time} · {d.author}</p>
              </div>
              <Badge variant="success">Deployed</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
