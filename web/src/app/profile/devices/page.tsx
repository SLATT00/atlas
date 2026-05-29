'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ChevronLeft, Smartphone, Monitor, Tablet, X } from 'lucide-react';

const mockDevices = [
  { id: '1', name: 'iPhone 15 Pro', type: 'mobile', os: 'iOS 18.2', ip: '185.12.xx.xx', location: 'Москва', lastSeen: 'Сейчас', trusted: true, current: true },
  { id: '2', name: 'MacBook Pro', type: 'desktop', os: 'macOS 15.1', ip: '185.12.xx.xx', location: 'Москва', lastSeen: '2 часа назад', trusted: true, current: false },
  { id: '3', name: 'iPad Air', type: 'tablet', os: 'iPadOS 18.2', ip: '91.234.xx.xx', location: 'Санкт-Петербург', lastSeen: '3 дня назад', trusted: false, current: false },
];

const deviceIcons = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };

export default function DevicesPage() {
  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile/security" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <h1 className="text-section text-atlas-text">Устройства</h1>
      </div>

      <div className="space-y-3">
        {mockDevices.map((device) => {
          const Icon = deviceIcons[device.type as keyof typeof deviceIcons] || Smartphone;
          return (
            <Card key={device.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-atlas-elevated flex items-center justify-center mt-0.5">
                    <Icon size={18} className="text-atlas-text-secondary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-body text-atlas-text font-medium">{device.name}</p>
                      {device.current && <Badge variant="info">Текущее</Badge>}
                      {device.trusted && !device.current && <Badge variant="success">Доверенное</Badge>}
                    </div>
                    <p className="text-label text-atlas-muted mt-0.5">{device.os}</p>
                    <p className="text-label text-atlas-muted">{device.location} · {device.ip}</p>
                    <p className="text-label text-atlas-muted">{device.lastSeen}</p>
                  </div>
                </div>
                {!device.current && (
                  <button className="p-2 rounded-lg hover:bg-atlas-error/10 transition-colors">
                    <X size={16} className="text-atlas-error" />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
