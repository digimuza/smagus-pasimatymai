'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';

export function useSessionTracking(meta: { audience?: string; locale?: string }) {
  useEffect(() => {
    analytics.init({
      audience: meta.audience,
      locale: meta.locale,
    });

    return () => {
      analytics.destroy();
    };
  }, [meta.audience, meta.locale]);
}
