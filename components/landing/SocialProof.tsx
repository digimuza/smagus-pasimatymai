import { useTranslations } from "next-intl";

export function SocialProof() {
	const t = useTranslations("landing");

	return (
		<section className="py-12 content-auto sm:py-16">
			<div className="mx-auto max-w-6xl space-y-3 px-4 text-center sm:px-6 lg:px-8">
				<p className="text-sm text-text-dimmed italic">{t("testimonial")}</p>
				<div className="flex justify-center gap-1">
					{[...new Array(5)].map((_, i) => (
						<span className="text-primary text-sm" key={i}>
							★
						</span>
					))}
				</div>
				<p className="text-text-dimmed/50 text-xs">{t("testimonialAuthor")}</p>
			</div>
		</section>
	);
}
