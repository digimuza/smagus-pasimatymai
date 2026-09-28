import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LandingFooter() {
	const t = useTranslations("landing");
	const tLegal = useTranslations("legal");

	return (
		<footer className="border-white/10 border-t bg-[#120b1b] py-10 text-center">
			<p className="font-serif text-[#d3bac9] text-base italic">
				{t("footer")}
			</p>
			<div className="mt-3 flex justify-center gap-4">
				<Link
					className="text-[#bfaabb] text-xs underline-offset-2 hover:underline"
					href="/privacy"
				>
					{tLegal("privacy")}
				</Link>
				<Link
					className="text-[#bfaabb] text-xs underline-offset-2 hover:underline"
					href="/terms"
				>
					{tLegal("terms")}
				</Link>
			</div>
			<p className="mt-3 text-[#9d899b] text-xs">
				© {new Date().getFullYear()}
			</p>
		</footer>
	);
}
