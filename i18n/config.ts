export const locales = ['lt', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'lt';

export const localeNames: Record<Locale, string> = {
  lt: 'Lietuvių',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  lt: '🇱🇹',
  en: '🇬🇧',
};
