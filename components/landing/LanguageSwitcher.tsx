'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { locales, localeFlags, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: Locale) {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-1">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`text-lg px-1.5 py-1 rounded-lg transition-all ${
            l === locale
              ? 'bg-background-lighter scale-110'
              : 'opacity-60 hover:opacity-100 hover:bg-background-light/50'
          }`}
          aria-label={l}
        >
          {localeFlags[l]}
        </button>
      ))}
    </div>
  );
}
