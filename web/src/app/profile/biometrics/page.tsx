'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { ChevronLeft, Scan, Fingerprint, LogIn } from 'lucide-react';

interface BiometricToggleProps {
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  onToggle: () => void;
}

function BiometricToggle({ label, description, icon: Icon, enabled, onToggle }: BiometricToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-atlas-text-secondary" />
        <div>
          <p className="text-body text-atlas-text">{label}</p>
          <p className="text-label text-atlas-muted">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors relative ${
          enabled ? 'bg-atlas-accent' : 'bg-atlas-card border border-white/20'
        }`}
      >
        <div
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: enabled ? 'translateX(22px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

export default function BiometricsPage() {
  const [settings, setSettings] = useState({
    faceId: true,
    touchId: false,
    biometricLogin: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile/security" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <h1 className="text-section text-atlas-text">Биометрия</h1>
      </div>

      <Card>
        <div className="divide-y divide-white/5">
          <BiometricToggle
            label="Face ID"
            description="Разблокировка с помощью лица"
            icon={Scan}
            enabled={settings.faceId}
            onToggle={() => toggle('faceId')}
          />
          <BiometricToggle
            label="Touch ID"
            description="Разблокировка отпечатком пальца"
            icon={Fingerprint}
            enabled={settings.touchId}
            onToggle={() => toggle('touchId')}
          />
          <BiometricToggle
            label="Биометрический вход"
            description="Вход в приложение по биометрии"
            icon={LogIn}
            enabled={settings.biometricLogin}
            onToggle={() => toggle('biometricLogin')}
          />
        </div>
      </Card>
    </AppShell>
  );
}
