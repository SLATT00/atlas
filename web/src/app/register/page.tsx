'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    language: 'ru',
    country: 'RU',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateStep1 = () => {
    if (!form.email || !form.phone) {
      setError('Заполните все поля');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (form.password.length < 12) {
      setError('Пароль должен содержать минимум 12 символов');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const res = await api.post<{ user: any; tokens: { access_token: string } }>(
        '/api/v1/auth/register',
        {
          email: form.email,
          phone: form.phone,
          password: form.password,
          language: form.language,
          country: form.country,
        }
      );
      login(res.user, res.tokens.access_token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-atlas-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-hero text-atlas-text mb-2">ATLAS</h1>
          <p className="text-secondary text-atlas-text-secondary">Создайте аккаунт</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-atlas-accent' : 'bg-atlas-card'}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-atlas-accent' : 'bg-atlas-card'}`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-atlas-error/10 border border-atlas-error/20">
              <p className="text-secondary text-atlas-error">{error}</p>
            </div>
          )}

          {step === 1 && (
            <>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                label="Телефон"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <Button type="button" className="w-full" size="lg" onClick={handleNext}>
                Далее
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Input
                label="Пароль"
                type="password"
                placeholder="Минимум 12 символов"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                hint="Заглавные, строчные, цифры и спецсимволы"
              />
              <Input
                label="Подтвердите пароль"
                type="password"
                placeholder="Повторите пароль"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" size="lg" onClick={() => setStep(1)}>
                  Назад
                </Button>
                <Button type="submit" className="flex-1" size="lg" loading={loading}>
                  Создать
                </Button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-secondary text-atlas-text-secondary mt-6">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-atlas-accent hover:text-atlas-accent-alt transition-colors">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
