'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { ChevronLeft, MessageCircle, Mail, Phone, HelpCircle } from 'lucide-react';

const supportOptions = [
  {
    icon: MessageCircle,
    label: 'Чат поддержки',
    description: 'Онлайн-чат с оператором 24/7',
    detail: 'Среднее время ответа: 2 минуты',
    color: 'text-atlas-accent',
    bg: 'bg-atlas-accent/15',
  },
  {
    icon: Mail,
    label: 'Email',
    description: 'support@atlas.bank',
    detail: 'Ответ в течение 24 часов',
    color: 'text-atlas-accent',
    bg: 'bg-atlas-accent/15',
  },
  {
    icon: Phone,
    label: 'Телефон',
    description: '+7 (800) 100-00-00',
    detail: 'Бесплатно по России, 24/7',
    color: 'text-atlas-success',
    bg: 'bg-atlas-success/15',
  },
  {
    icon: HelpCircle,
    label: 'FAQ',
    description: 'Часто задаваемые вопросы',
    detail: 'Более 200 ответов на популярные вопросы',
    color: 'text-atlas-text-secondary',
    bg: 'bg-atlas-elevated',
  },
];

export default function SupportPage() {
  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} className="text-atlas-text-secondary" />
        </Link>
        <h1 className="text-section text-atlas-text">Поддержка</h1>
      </div>

      <div className="space-y-3">
        {supportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card key={option.label}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full ${option.bg} flex items-center justify-center mt-0.5`}>
                  <Icon size={18} className={option.color} />
                </div>
                <div className="flex-1">
                  <p className="text-body text-atlas-text font-medium">{option.label}</p>
                  <p className="text-secondary text-atlas-text-secondary mt-0.5">{option.description}</p>
                  <p className="text-label text-atlas-muted mt-1">{option.detail}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
