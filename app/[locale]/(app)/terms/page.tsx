"use client";

import { useTranslations } from "next-intl";
import { Header, PageContent, PageLayout } from "@/components/ui";

const SECTION_KEYS = [
	"service",
	"accounts",
	"subscriptions",
	"freeTrialAndCancellation",
	"userContent",
	"acceptableUse",
	"intellectualProperty",
	"liability",
	"termination",
	"changes",
	"governingLaw",
	"contact",
] as const;

export default function TermsPage() {
	const t = useTranslations("terms");

	return (
		<PageLayout>
			<Header showBack title={t("title")} />
			<PageContent>
				<div className="mx-auto max-w-2xl space-y-6 pb-12">
					<p className="text-sm text-text-dimmed">{t("lastUpdated")}</p>
					<p className="text-text-secondary leading-relaxed">{t("intro")}</p>
					{SECTION_KEYS.map((key) => (
						<section className="space-y-2" key={key}>
							<h2 className="font-semibold text-lg text-text-primary">
								{t(`sections.${key}.title`)}
							</h2>
							<div className="whitespace-pre-line text-sm text-text-secondary leading-relaxed">
								{t(`sections.${key}.content`)}
							</div>
						</section>
					))}
				</div>
			</PageContent>
		</PageLayout>
	);
}
