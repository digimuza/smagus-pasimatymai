import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LandingFooter() {
	const t = useTranslations("landing");
	const tLegal = useTranslations("legal");

	return (
		<footer className="border-primary/5 border-t py-8 text-center">
			<p className="text-text-dimmed text-xs">{t("footer")}</p>
			<div className="mt-3 flex justify-center gap-4">
				<Link
					className="text-text-dimmed text-xs underline-offset-2 hover:underline"
					href="/privacy"
				>
					{tLegal("privacy")}
				</Link>
				<Link
					className="text-text-dimmed text-xs underline-offset-2 hover:underline"
					href="/terms"
				>
					{tLegal("terms")}
				</Link>
			</div>
			<p className="mt-2 text-text-dimmed text-xs">
				© {new Date().getFullYear()}
			</p>
		</footer>
	);
}
