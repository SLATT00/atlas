'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ChevronLeft, CheckCircle, FileText, Camera, MapPin } from 'lucide-react';

const documents = [
  { icon: FileText, label: 'Паспорт', status: 'Подтверждён', date: '12 января 2026' },
  { icon: Camera, label: 'Selfie', status: 'Подтверждён', date: '12 января 2026' },
  { icon: MapPin, label: 'Proof of Address', status: 'Подтверждён', date: '15 января 2026' },
];

export default function VerificationPage() {
  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <h1 className="text-section text-atlas-text">Верификация</h1>
      </div>

      {/* Status */}
      <Card className="mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-atlas-success/15 flex items-center justify-center">
            <CheckCircle size={18} className="text-atlas-success" />
          </div>
          <div>
            <p className="text-body text-atlas-text font-medium">Подтверждён</p>
            <p className="text-label text-atlas-muted">Уровень: Enhanced</p>
          </div>
          <div className="ml-auto">
            <Badge variant="success">Verified</Badge>
          </div>
        </div>
      </Card>

      {/* Documents */}
      <h2 className="text-card-title text-atlas-text mb-3 mt-6">Документы</h2>
      <div className="space-y-3">
        {documents.map((doc) => {
          const Icon = doc.icon;
          return (
            <Card key={doc.label}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-atlas-elevated flex items-center justify-center">
                    <Icon size={18} className="text-atlas-text-secondary" />
                  </div>
                  <div>
                    <p className="text-body text-atlas-text">{doc.label}</p>
                    <p className="text-label text-atlas-muted">{doc.date}</p>
                  </div>
                </div>
                <Badge variant="success">{doc.status}</Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Verification Level */}
      <h2 className="text-card-title text-atlas-text mb-3 mt-6">Уровень верификации</h2>
      <Card>
        <div className="space-y-3">
          {[
            { level: 'Basic', description: 'Регистрация по email', done: true },
            { level: 'Verified', description: 'Документы и Selfie', done: true },
            { level: 'Enhanced', description: 'Proof of Address', done: true },
          ].map((item) => (
            <div key={item.level} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    item.done ? 'bg-atlas-success/15' : 'bg-atlas-elevated'
                  }`}
                >
                  {item.done && <CheckCircle size={14} className="text-atlas-success" />}
                </div>
                <div>
                  <p className="text-body text-atlas-text">{item.level}</p>
                  <p className="text-label text-atlas-muted">{item.description}</p>
                </div>
              </div>
              {item.done && <Badge variant="success">Пройден</Badge>}
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
