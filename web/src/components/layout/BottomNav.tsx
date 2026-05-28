'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  Home,
  Wallet,
  CreditCard,
  ArrowLeftRight,
  Package,
  User,
} from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Главная' },
  { href: '/accounts', icon: Wallet, label: 'Счета' },
  { href: '/cards', icon: CreditCard, label: 'Карты' },
  { href: '/transfers', icon: ArrowLeftRight, label: 'Переводы' },
  { href: '/products', icon: Package, label: 'Продукты' },
  { href: '/profile', icon: User, label: 'Профиль' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-atlas-bg/95 backdrop-blur-lg border-t border-white/5">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px]',
                isActive
                  ? 'text-atlas-accent'
                  : 'text-atlas-muted hover:text-atlas-text-secondary'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
