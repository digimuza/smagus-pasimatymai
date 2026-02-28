export const locales = ["lt", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "lt";

export const localeNames: Record<Locale, string> = {
	en: "English",
	lt: "Lietuvių",
};

export const localeFlags: Record<Locale, string> = {
	en: "🇬🇧",
	lt: "🇱🇹",
};
