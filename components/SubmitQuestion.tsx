'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useQuestions } from '@/context/QuestionContext';
import { Sheet, Button } from '@/components/ui';

interface SubmitQuestionProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitQuestion({ isOpen, onClose }: SubmitQuestionProps) {
  const t = useTranslations('submit');
  const { isAuthenticated } = useAuth();
  const { audience } = useQuestions();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || text.trim().length < 10) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: text.trim(), audience: audience || 'romantic' }),
      });

      if (res.ok) {
        setSubmitted(true);
        setText('');
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} side="bottom">
      <div className="p-6 max-w-md mx-auto">
        {submitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <span className="text-5xl mb-4 block">✅</span>
            <p className="text-text font-semibold">{t('success')}</p>
            <p className="text-text-muted text-sm mt-1">{t('successNote')}</p>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-4">
              <span className="text-3xl mb-2 block">💡</span>
              <h2 className="text-xl font-bold text-text">{t('title')}</h2>
              <p className="text-text-muted text-sm mt-1">{t('subtitle')}</p>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('placeholder')}
              maxLength={300}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-background-lighter border border-primary/10 text-text placeholder:text-text-dimmed text-sm focus:outline-none focus:border-primary/30 resize-none mb-2"
            />

            <div className="flex justify-between items-center mb-4">
              <span className="text-text-dimmed text-xs">{text.length}/300</span>
              <span className="text-text-dimmed text-xs">{t('minChars')}</span>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={isSubmitting || text.trim().length < 10}
            >
              {isSubmitting ? t('submitting') : t('submitButton')}
            </Button>
          </>
        )}
      </div>
    </Sheet>
  );
}
