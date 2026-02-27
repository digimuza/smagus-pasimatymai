export const locales = ['lt', 'en', 'pl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'lt';

export const localeNames: Record<Locale, string> = {
  lt: 'Lietuvių',
  en: 'English',
  pl: 'Polski',
};

export const localeFlags: Record<Locale, string> = {
  lt: '🇱🇹',
  en: '🇬🇧',
  pl: '🇵🇱',
};
