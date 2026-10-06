import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function LandingNav() {
	const t = useTranslations("landing.nav");

	return (
		<header className="sticky top-0 z-50 border-white/10 border-b bg-[#160e1e]">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-3">
					<span
						aria-hidden="true"
						className="font-serif text-2xl text-[#f5c7a9]"
					>
						♥
					</span>
					<span className="hidden font-serif text-[#f5e3df] text-lg tracking-wide sm:inline">
						{t("logo")}
					</span>
				</div>
				<LanguageSwitcher />
			</div>
		</header>
	);
}
