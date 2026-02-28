import { useTranslations } from "next-intl";

export function LandingFooter() {
	const t = useTranslations("landing");

	return (
		<footer className="border-primary/5 border-t py-8 text-center">
			<p className="text-text-dimmed/40 text-xs">{t("footer")}</p>
			<p className="mt-2 text-text-dimmed/30 text-xs">
				© {new Date().getFullYear()}
			</p>
		</footer>
	);
}
