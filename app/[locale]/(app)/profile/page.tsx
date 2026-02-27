'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/context/AuthContext';
import { useQuestions } from '@/context/QuestionContext';
import { Header, Button } from '@/components/ui';
import { SubscriptionBadge } from '@/components/payments/SubscriptionBadge';
import { isPremium } from '@/lib/subscription';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tc = useTranslations('common');
  const { player, subscription, logout, isAuthenticated, isLoading } = useAuth();
  const tp = useTranslations('payments');
  const { questionStates } = useQuestions();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-xl">{tc('loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated || !player) {
    router.push('/');
    return null;
  }

  const stats = {
    answered: questionStates.filter((q) => q.status === 'answered').length,
    skipped: questionStates.filter((q) => q.status === 'skipped').length,
    superliked: questionStates.filter((q) => q.status === 'superliked').length,
    total: questionStates.length,
  };

  const handleDelete = async () => {
    if (deleteConfirm !== player.email) return;
    setIsDeleting(true);

    try {
      // Delete all progress
      await fetch('/api/progress', {
        method: 'DELETE',
        credentials: 'include',
      });

      // Delete player account
      await fetch(`/api/players/${player.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      await logout();
      router.push('/');
    } catch {
      setIsDeleting(false);
    }
  };

  const initials = (player.name || player.email)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('title')} backHref="/game" />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Player info */}
        <div className="flex items-center gap-4 p-4 bg-background-lighter rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden flex-shrink-0">
            {player.avatar ? (
              <img src={player.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-lg font-semibold">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            {player.name && (
              <p className="text-text font-semibold truncate">{player.name}</p>
            )}
            <p className="text-text-muted text-sm truncate">{player.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-text-dimmed text-xs">
                {player.provider === 'google' ? 'Google' : t('emailProvider')}
              </p>
              <SubscriptionBadge />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-background-lighter rounded-xl text-center">
            <p className="text-2xl font-semibold text-primary">{stats.answered}</p>
            <p className="text-text-dimmed text-xs mt-1">{t('statsAnswered')}</p>
          </div>
          <div className="p-4 bg-background-lighter rounded-xl text-center">
            <p className="text-2xl font-semibold text-accent">{stats.superliked}</p>
            <p className="text-text-dimmed text-xs mt-1">{t('statsSuperliked')}</p>
          </div>
          <div className="p-4 bg-background-lighter rounded-xl text-center">
            <p className="text-2xl font-semibold text-text-muted">{stats.total}</p>
            <p className="text-text-dimmed text-xs mt-1">{t('statsTotal')}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isPremium(subscription) && (
            <Button
              variant="secondary"
              fullWidth
              onClick={async () => {
                const res = await fetch('/api/billing/portal', {
                  method: 'POST',
                  credentials: 'include',
                });
                if (res.ok) {
                  const { url } = await res.json();
                  if (url) window.location.href = url;
                }
              }}
            >
              {tp('manageSubscription')}
            </Button>
          )}
          <Button
            variant="secondary"
            fullWidth
            onClick={async () => { await logout(); router.push('/'); }}
          >
            {t('logout')}
          </Button>
        </div>

        {/* Danger zone */}
        <div className="p-4 bg-background-lighter rounded-2xl border border-red-500/20">
          <h3 className="text-red-400 font-semibold text-sm mb-2">{t('dangerZone')}</h3>
          <p className="text-text-dimmed text-xs mb-3">{t('deleteWarning')}</p>
          <input
            type="text"
            placeholder={t('deleteConfirmPlaceholder')}
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-red-500/20 text-text placeholder:text-text-dimmed text-sm mb-3 focus:outline-none focus:border-red-500/40"
          />
          <Button
            variant="danger"
            fullWidth
            disabled={deleteConfirm !== player.email || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? t('deleting') : t('deleteButton')}
          </Button>
        </div>
      </div>
    </div>
  );
}
