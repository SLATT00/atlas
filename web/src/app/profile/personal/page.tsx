'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';

export default function PersonalPage() {
  const [form, setForm] = useState({
    firstName: 'Михаил',
    lastName: 'Иванов',
    email: 'mikhail@atlas.bank',
    phone: '+7 (999) 123-45-67',
    dateOfBirth: '1990-05-15',
    citizenship: 'Россия',
    address: 'г. Москва, ул. Примерная, д. 12, кв. 34',
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <h1 className="text-section text-atlas-text">Личные данные</h1>
      </div>

      <Card className="mb-3">
        <div className="space-y-4">
          <Input
            label="Имя"
            value={form.firstName}
            onChange={(e) => update('firstName', e.target.value)}
          />
          <Input
            label="Фамилия"
            value={form.lastName}
            onChange={(e) => update('lastName', e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
          <Input
            label="Телефон"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
          <Input
            label="Дата рождения"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update('dateOfBirth', e.target.value)}
          />
          <Input
            label="Гражданство"
            value={form.citizenship}
            onChange={(e) => update('citizenship', e.target.value)}
          />
          <Input
            label="Адрес"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
          />
        </div>
      </Card>

      <Button className="w-full mt-4" size="lg">
        Сохранить
      </Button>
    </AppShell>
  );
}
