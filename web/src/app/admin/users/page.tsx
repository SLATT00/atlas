'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, MoreVertical } from 'lucide-react';

const mockUsers = [
  { id: 'u_001', name: 'Михаил Иванов', email: 'mikhail@example.com', status: 'active', kyc: 'verified', tier: 'premium', balance: '₽8.4M', joined: '2024-01-15' },
  { id: 'u_002', name: 'Анна Петрова', email: 'anna@example.com', status: 'active', kyc: 'verified', tier: 'standard', balance: '₽1.2M', joined: '2024-03-22' },
  { id: 'u_003', name: 'John Smith', email: 'john@example.com', status: 'active', kyc: 'pending', tier: 'standard', balance: '$45K', joined: '2024-06-10' },
  { id: 'u_004', name: 'Елена Козлова', email: 'elena@example.com', status: 'suspended', kyc: 'rejected', tier: 'standard', balance: '₽0', joined: '2024-08-01' },
  { id: 'u_005', name: 'Дмитрий Волков', email: 'dmitry@example.com', status: 'active', kyc: 'verified', tier: 'private', balance: '₽52M', joined: '2023-11-05' },
  { id: 'u_006', name: 'Maria Garcia', email: 'maria@example.com', status: 'active', kyc: 'verified', tier: 'business', balance: '€120K', joined: '2024-02-18' },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');

  const filtered = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.id.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-header text-atlas-text">Пользователи</h1>
        <span className="text-secondary text-atlas-text-secondary">124,531 всего</span>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Поиск по имени, email или ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">ID</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Пользователь</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Статус</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">KYC</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Тариф</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Баланс</th>
                <th className="text-left text-label text-atlas-muted py-3 px-3 font-medium">Дата</th>
                <th className="text-label text-atlas-muted py-3 px-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 text-label text-atlas-muted font-mono">{user.id}</td>
                  <td className="py-3 px-3">
                    <p className="text-secondary text-atlas-text">{user.name}</p>
                    <p className="text-label text-atlas-muted">{user.email}</p>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                      {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={user.kyc === 'verified' ? 'success' : user.kyc === 'pending' ? 'warning' : 'error'}>
                      {user.kyc}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-secondary text-atlas-text capitalize">{user.tier}</td>
                  <td className="py-3 px-3 text-secondary text-atlas-text font-medium">{user.balance}</td>
                  <td className="py-3 px-3 text-label text-atlas-muted">{user.joined}</td>
                  <td className="py-3 px-3">
                    <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      <MoreVertical size={16} className="text-atlas-muted" />
                    </button>
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
