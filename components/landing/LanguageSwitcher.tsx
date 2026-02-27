'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeFlags, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: Locale) {
    if (newLocale === locale) return;

    // Remove current locale prefix from pathname
    const segments = pathname.split('/');
    const hasLocalePrefix = locales.includes(segments[1] as Locale);
    const pathWithoutLocale = hasLocalePrefix
      ? '/' + segments.slice(2).join('/')
      : pathname;

    // Build new path
    const newPath = newLocale === 'lt'
      ? pathWithoutLocale || '/'
      : `/${newLocale}${pathWithoutLocale}`;

    router.push(newPath);
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
