'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth';
import { useDataStore } from '@/store/data';
import {
  User,
  Shield,
  CheckCircle,
  Settings,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Bell,
  Fingerprint,
  Smartphone,
} from 'lucide-react';

const menuItems = [
  { icon: User, label: 'Личные данные', href: '/profile/personal', badge: null },
  { icon: Shield, label: 'Безопасность', href: '/profile/security', badge: null },
  { icon: CheckCircle, label: 'Верификация', href: '/profile/verification', badge: 'Подтверждён' },
  { icon: Bell, label: 'Уведомления', href: '/profile/notifications', badge: null },
  { icon: Fingerprint, label: 'Биометрия', href: '/profile/biometrics', badge: null },
  { icon: Smartphone, label: 'Устройства', href: '/profile/devices', badge: '3' },
  { icon: Settings, label: 'Настройки', href: '/profile/settings', badge: null },
  { icon: Globe, label: 'Язык', href: '/profile/language', badge: null },
  { icon: HelpCircle, label: 'Поддержка', href: '/profile/support', badge: null },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const notifications = useDataStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const displayName = user?.name || 'Михаил Иванов';

  return (
    <AppShell>
      {/* User Header */}
      <section className="flex items-center gap-4 mb-6">
        <Avatar name={displayName} size="lg" />
        <div>
          <h1 className="text-section text-atlas-text">{displayName}</h1>
          <p className="text-secondary text-atlas-text-secondary">Premium</p>
        </div>
      </section>

      {/* Account Status */}
      <Card className="mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-label text-atlas-muted">Статус</p>
            <Badge variant="success">Активен</Badge>
          </div>
          <div>
            <p className="text-label text-atlas-muted">KYC</p>
            <Badge variant="success">Verified</Badge>
          </div>
          <div>
            <p className="text-label text-atlas-muted">Тариф</p>
            <Badge variant="info">Premium</Badge>
          </div>
        </div>
      </Card>

      {/* Menu */}
      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isNotif = item.icon === Bell;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="w-full flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className="text-atlas-text-secondary" />
                <span className="text-body text-atlas-text">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {isNotif && unreadCount > 0 && (
                  <span className="min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-atlas-error text-white text-[11px] font-semibold px-1">
                    {unreadCount}
                  </span>
                )}
                {item.badge && (
                  <span className="text-label text-atlas-muted">{item.badge}</span>
                )}
                <ChevronRight size={16} className="text-atlas-muted" />
              </div>
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-3.5 px-3 rounded-xl hover:bg-atlas-error/5 transition-colors mt-4"
        >
          <LogOut size={20} className="text-atlas-error" />
          <span className="text-body text-atlas-error">Выйти</span>
        </button>
      </div>
    </AppShell>
  );
}
