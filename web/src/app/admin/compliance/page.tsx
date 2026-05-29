'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const mockCases = [
  { id: 'C-001', user: 'user_8291', type: 'AML', status: 'open', risk: 85, assignee: 'Иванов А.', created: '2026-05-29' },
  { id: 'C-002', user: 'user_1204', type: 'PEP', status: 'review', risk: 72, assignee: 'Петрова М.', created: '2026-05-28' },
  { id: 'C-003', user: 'user_3391', type: 'Sanctions', status: 'open', risk: 95, assignee: null, created: '2026-05-28' },
  { id: 'C-004', user: 'user_5512', type: 'AML', status: 'closed', risk: 30, assignee: 'Козлов Д.', created: '2026-05-27' },
  { id: 'C-005', user: 'user_7744', type: 'PEP', status: 'review', risk: 60, assignee: 'Иванов А.', created: '2026-05-26' },
];

export default function CompliancePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-header text-atlas-text">Комплаенс</h1>
        <div className="flex gap-2">
          <Badge variant="error">3 открытых</Badge>
          <Badge variant="warning">2 на проверке</Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-label text-atlas-muted">KYC на проверке</p>
          <p className="text-section text-atlas-text font-bold mt-1">156</p>
        </Card>
        <Card>
          <p className="text-label text-atlas-muted">PEP совпадения</p>
          <p className="text-section text-atlas-text font-bold mt-1">8</p>
        </Card>
        <Card>
          <p className="text-label text-atlas-muted">Санкции</p>
          <p className="text-section text-atlas-error font-bold mt-1">2</p>
        </Card>
        <Card>
          <p className="text-label text-atlas-muted">Средний риск-скор</p>
          <p className="text-section text-atlas-warning font-bold mt-1">42</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-card-title text-atlas-text mb-4">Кейсы</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">ID</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Пользователь</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Тип</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Статус</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Риск</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Ответственный</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {mockCases.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 text-secondary text-atlas-text font-mono">{c.id}</td>
                  <td className="py-3 px-3 text-secondary text-atlas-text">{c.user}</td>
                  <td className="py-3 px-3"><Badge variant="neutral">{c.type}</Badge></td>
                  <td className="py-3 px-3">
                    <Badge variant={c.status === 'open' ? 'error' : c.status === 'review' ? 'warning' : 'success'}>
                      {c.status === 'open' ? 'Открыт' : c.status === 'review' ? 'Проверка' : 'Закрыт'}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-secondary font-medium ${c.risk >= 80 ? 'text-atlas-error' : c.risk >= 50 ? 'text-atlas-warning' : 'text-atlas-success'}`}>
                      {c.risk}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-secondary text-atlas-text-secondary">{c.assignee || '—'}</td>
                  <td className="py-3 px-3">
                    <Button size="sm" variant="ghost">Открыть</Button>
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
