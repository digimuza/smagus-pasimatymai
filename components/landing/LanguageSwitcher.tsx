"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useState, useTransition } from "react";
import {
	defaultLocale,
	type Locale,
	localeFlags,
	localeNames,
	locales,
} from "@/i18n/config";
import { usePathname } from "@/i18n/navigation";

export function LanguageSwitcher() {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();
	const [target, setTarget] = useState<Locale | null>(null);

	return (
		<nav
			aria-busy={isPending}
			aria-label="Language"
			className="flex items-center gap-1"
		>
			{locales.map((language) => (
				<a
					aria-current={language === locale ? "true" : undefined}
					aria-disabled={isPending || undefined}
					aria-label={localeNames[language]}
					className={`relative flex h-11 min-w-11 items-center justify-center rounded-lg text-lg transition-colors ${language === locale ? "bg-background-lighter" : "opacity-70 hover:bg-background-light/50 hover:opacity-100"}`}
					href={`/${language}${pathname === "/" ? "" : pathname}`}
					hrefLang={language}
					key={language}
					onClick={(event) => {
						if (
							event.metaKey ||
							event.ctrlKey ||
							event.shiftKey ||
							event.altKey ||
							event.button !== 0
						)
							return;
						event.preventDefault();
						if (isPending || language === locale) return;
						setTarget(language);
						// Set the locale before navigating to the canonical URL to avoid a redirect.
						// biome-ignore lint/suspicious/noDocumentCookie: synchronous locale cookie also supports older mobile Safari
						document.cookie = `NEXT_LOCALE=${language}; Path=/; SameSite=Lax`;
						const prefix = language === defaultLocale ? "" : `/${language}`;
						const destination =
							`${prefix}${pathname === "/" ? "" : pathname}` || "/";
						startTransition(() =>
							router.replace(
								`${destination}${window.location.search}${window.location.hash}`,
								{ scroll: false },
							),
						);
					}}
				>
					{localeFlags[language]}
					{isPending && target === language && (
						<span
							aria-hidden="true"
							className="absolute inset-x-2 bottom-1 h-0.5 bg-[#f5c7a9]"
						/>
					)}
				</a>
			))}
		</nav>
	);
}
