import { useTranslations } from "next-intl";

export function FeaturesGrid() {
	const t = useTranslations("landing.features");

	const features = [
		{ count: t("questions.count"), icon: "🃏", label: t("questions.label") },
		{ count: t("spicy.count"), icon: "🌶️", label: t("spicy.label") },
		{ count: t("categories.count"), icon: "💕", label: t("categories.label") },
	];

	return (
		<section className="py-16 content-auto sm:py-20">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div className="mx-auto grid max-w-md grid-cols-3 gap-4 sm:gap-6">
					{features.map((f) => (
						<div
							className="flex flex-col items-center gap-2 rounded-2xl border border-primary/10 bg-background-light/50 p-4 backdrop-blur-sm"
							key={f.count}
						>
							<span className="text-2xl">{f.icon}</span>
							<span className="font-semibold text-lg text-text">{f.count}</span>
							<span className="text-text-dimmed text-xs">{f.label}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
