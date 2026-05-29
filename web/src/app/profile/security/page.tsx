'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  ChevronLeft,
  Shield,
  Key,
  Smartphone,
  Fingerprint,
  Lock,
  AlertTriangle,
} from 'lucide-react';

export default function SecurityPage() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <h1 className="text-section text-atlas-text">Безопасность</h1>
      </div>

      {/* 2FA */}
      <Card className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-atlas-success/15 flex items-center justify-center">
              <Shield size={18} className="text-atlas-success" />
            </div>
            <div>
              <p className="text-body text-atlas-text">Двухфакторная аутентификация</p>
              <p className="text-label text-atlas-muted">Authenticator App</p>
            </div>
          </div>
          <Badge variant="success">Включена</Badge>
        </div>
      </Card>

      {/* Biometrics */}
      <Card className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-atlas-accent/15 flex items-center justify-center">
              <Fingerprint size={18} className="text-atlas-accent" />
            </div>
            <div>
              <p className="text-body text-atlas-text">Биометрия</p>
              <p className="text-label text-atlas-muted">Face ID / Touch ID</p>
            </div>
          </div>
          <Badge variant="success">Включена</Badge>
        </div>
      </Card>

      {/* Password */}
      <Card className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-atlas-elevated flex items-center justify-center">
              <Key size={18} className="text-atlas-text-secondary" />
            </div>
            <div>
              <p className="text-body text-atlas-text">Пароль</p>
              <p className="text-label text-atlas-muted">Последнее изменение: 15 мая 2026</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowPasswordForm(!showPasswordForm)}>
            Изменить
          </Button>
        </div>

        {showPasswordForm && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
            <Input
              label="Текущий пароль"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            />
            <Input
              label="Новый пароль"
              type="password"
              hint="Минимум 12 символов"
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
            />
            <Input
              label="Подтвердите пароль"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            />
            <Button size="sm" className="w-full">Сохранить пароль</Button>
          </div>
        )}
      </Card>

      {/* Devices */}
      <Card className="mb-3">
        <Link href="/profile/devices" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-atlas-elevated flex items-center justify-center">
              <Smartphone size={18} className="text-atlas-text-secondary" />
            </div>
            <div>
              <p className="text-body text-atlas-text">Устройства</p>
              <p className="text-label text-atlas-muted">3 активных устройства</p>
            </div>
          </div>
          <Badge variant="neutral">3</Badge>
        </Link>
      </Card>

      {/* Session Lock */}
      <Card className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-atlas-elevated flex items-center justify-center">
              <Lock size={18} className="text-atlas-text-secondary" />
            </div>
            <div>
              <p className="text-body text-atlas-text">Автоблокировка</p>
              <p className="text-label text-atlas-muted">Через 5 минут неактивности</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-atlas-error/20">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={18} className="text-atlas-error" />
          <h3 className="text-card-title text-atlas-error">Опасная зона</h3>
        </div>
        <Button size="sm" variant="danger" className="w-full">
          Завершить все сессии
        </Button>
      </Card>
    </AppShell>
  );
}
