'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDataStore } from '@/store/data';
import { formatDate } from '@/lib/format';
import { ChevronLeft, Bell, CheckCheck } from 'lucide-react';

const typeIcons: Record<string, string> = {
  transfer: '💸',
  card: '💳',
  security: '🔒',
  savings: '📈',
  system: '⚙️',
};

export default function NotificationsPage() {
  const notifications = useDataStore((s) => s.notifications);
  const markNotificationRead = useDataStore((s) => s.markNotificationRead);
  const markAllRead = useDataStore((s) => s.markAllRead);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <div className="flex-1">
          <h1 className="text-section text-atlas-text">Уведомления</h1>
          {unreadCount > 0 && (
            <p className="text-label text-atlas-muted">{unreadCount} непрочитанных</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" onClick={markAllRead}>
            <CheckCheck size={14} className="mr-1.5" />
            Прочитать все
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Bell size={32} className="text-atlas-muted mx-auto mb-3" />
            <p className="text-secondary text-atlas-muted">Нет уведомлений</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.read && markNotificationRead(n.id)}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                n.read
                  ? 'bg-atlas-card/50 border-white/5'
                  : 'bg-atlas-card border-atlas-accent/20 hover:border-atlas-accent/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{typeIcons[n.type] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-secondary text-atlas-text font-medium truncate">{n.title}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-atlas-accent shrink-0" />}
                  </div>
                  <p className="text-label text-atlas-text-secondary mt-0.5">{n.body}</p>
                  <p className="text-label text-atlas-muted mt-1">{formatDate(n.date)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}
