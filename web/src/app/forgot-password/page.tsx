'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Введите email');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await new Promise((r) => setTimeout(r, 1000));
      setSent(true);
    } catch {
      setError('Ошибка отправки. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-atlas-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-atlas-success/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-atlas-success" />
          </div>
          <h1 className="text-header text-atlas-text mb-2">Письмо отправлено</h1>
          <p className="text-secondary text-atlas-text-secondary mb-6">
            Проверьте почту {email} и следуйте инструкциям для восстановления пароля.
          </p>
          <Link href="/login">
            <Button variant="secondary" className="w-full" size="lg">
              Вернуться к входу
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-atlas-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-header text-atlas-text mb-2">Восстановление пароля</h1>
          <p className="text-secondary text-atlas-text-secondary">
            Введите email, привязанный к аккаунту
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-atlas-error/10 border border-atlas-error/20">
              <p className="text-secondary text-atlas-error">{error}</p>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Отправить ссылку
          </Button>
        </form>

        <p className="text-center text-secondary text-atlas-text-secondary mt-6">
          <Link href="/login" className="text-atlas-accent hover:text-atlas-accent-alt transition-colors">
            Вернуться к входу
          </Link>
        </p>
      </div>
    </div>
  );
}
