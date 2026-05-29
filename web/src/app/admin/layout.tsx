'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Users,
  Shield,
  AlertTriangle,
  Settings,
} from 'lucide-react';

const adminNav = [
  { href: '/admin', icon: LayoutDashboard, label: 'Дашборд' },
  { href: '/admin/users', icon: Users, label: 'Пользователи' },
  { href: '/admin/compliance', icon: Shield, label: 'Комплаенс' },
  { href: '/admin/fraud', icon: AlertTriangle, label: 'Фрод' },
  { href: '/admin/operations', icon: Settings, label: 'Операции' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-atlas-bg flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-white/5 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-section text-atlas-text font-bold">ATLAS</h1>
          <p className="text-label text-atlas-muted">Admin Panel</p>
        </div>
        <nav className="space-y-1 flex-1">
          {adminNav.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-secondary',
                  isActive
                    ? 'bg-atlas-accent/10 text-atlas-accent'
                    : 'text-atlas-text-secondary hover:text-atlas-text hover:bg-white/5'
                )}
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
