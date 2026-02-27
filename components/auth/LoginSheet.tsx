'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Sheet, Button } from '@/components/ui';

interface LoginSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginSheet({ isOpen, onClose }: LoginSheetProps) {
  const t = useTranslations('auth');
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = mode === 'login'
        ? await login(email, password)
        : await register(email, password, name);

      if (result.success) {
        onClose();
        setEmail('');
        setPassword('');
        setName('');
      } else {
        setError(result.error || t('genericError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} side="bottom">
      <div className="p-6 max-w-sm mx-auto">
        <h2 className="text-2xl font-semibold text-text text-center mb-2">
          {mode === 'login' ? t('loginTitle') : t('registerTitle')}
        </h2>
        <p className="text-text-muted text-sm text-center mb-6">
          {mode === 'login' ? t('loginSubtitle') : t('registerSubtitle')}
        </p>

        {/* Google OAuth */}
        <Button
          variant="secondary"
          fullWidth
          onClick={loginWithGoogle}
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          }
        >
          {t('continueWithGoogle')}
        </Button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-primary/10" />
          <span className="text-text-dimmed text-xs">{t('or')}</span>
          <div className="flex-1 h-px bg-primary/10" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background-lighter border border-primary/10 text-text placeholder:text-text-dimmed text-sm focus:outline-none focus:border-primary/30"
            />
          )}
          <input
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-background-lighter border border-primary/10 text-text placeholder:text-text-dimmed text-sm focus:outline-none focus:border-primary/30"
          />
          <input
            type="password"
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl bg-background-lighter border border-primary/10 text-text placeholder:text-text-dimmed text-sm focus:outline-none focus:border-primary/30"
          />

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <Button variant="primary" fullWidth disabled={isSubmitting}>
            {isSubmitting
              ? t('submitting')
              : mode === 'login'
                ? t('loginButton')
                : t('registerButton')
            }
          </Button>
        </form>

        <p className="text-center text-text-dimmed text-sm mt-4">
          {mode === 'login' ? t('noAccount') : t('hasAccount')}{' '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-primary hover:underline"
          >
            {mode === 'login' ? t('registerLink') : t('loginLink')}
          </button>
        </p>
      </div>
    </Sheet>
  );
}
