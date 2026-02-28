"use client";

import { useLocale } from "next-intl";
import { type Locale, localeFlags, locales } from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/navigation";

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
					aria-label={l}
					className={`rounded-lg px-1.5 py-1 text-lg transition-all ${
						l === locale
							? "scale-110 bg-background-lighter"
							: "opacity-60 hover:bg-background-light/50 hover:opacity-100"
					}`}
					key={l}
					onClick={() => switchLocale(l)}
					type="button"
				>
					{localeFlags[l]}
				</button>
			))}
		</div>
	);
}
