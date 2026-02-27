'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { fadeInUp } from '@/lib/animations';
import { shareQuestion } from '@/lib/share';

interface DailyQuestionData {
  id: number;
  question: string;
  date: string;
}

export function DailyQuestion({ audience }: { audience: string }) {
  const t = useTranslations('daily');
  const [data, setData] = useState<DailyQuestionData | null>(null);

  useEffect(() => {
    fetch(`/api/daily-question?audience=${encodeURIComponent(audience)}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => {});
  }, [audience]);

  if (!data) return null;

  const handleShare = () => {
    shareQuestion(data.question, audience);
  };

  return (
    <motion.div
      {...fadeInUp}
      className="w-full max-w-md mx-auto p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📅</span>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          {t('label')}
        </span>
      </div>
      <p className="text-text text-lg font-light leading-relaxed mb-4">
        {data.question}
      </p>
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 text-text-muted hover:text-primary text-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {t('share')}
      </button>
    </motion.div>
  );
}
