'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const { demoLogin } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate
    if (!form.email || !form.password) {
      setError('Заполните все поля');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Пароль слишком короткий');
      setLoading(false);
      return;
    }

    // Demo login — in production this would call the API
    try {
      await new Promise((r) => setTimeout(r, 500));
      demoLogin();
      router.push('/');
    } catch {
      setError('Ошибка входа. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    demoLogin();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-atlas-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-hero text-atlas-text mb-2">ATLAS</h1>
          <p className="text-secondary text-atlas-text-secondary">Войдите в аккаунт</p>
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
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <Input
            label="Пароль"
            type="password"
            placeholder="Минимум 12 символов"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-secondary text-atlas-accent hover:text-atlas-accent-alt transition-colors"
            >
              Забыли пароль?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Войти
          </Button>
        </form>

        {/* Demo access */}
        <div className="mt-4">
          <Button variant="secondary" className="w-full" size="lg" onClick={handleDemoLogin}>
            Войти как демо-пользователь
          </Button>
        </div>

        <p className="text-center text-secondary text-atlas-text-secondary mt-6">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-atlas-accent hover:text-atlas-accent-alt transition-colors">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
