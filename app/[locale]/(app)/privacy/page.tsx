"use client";

import { useTranslations } from "next-intl";
import { Header, PageContent, PageLayout } from "@/components/ui";

const SECTION_KEYS = [
	"dataCollected",
	"purpose",
	"legalBasis",
	"thirdParties",
	"cookies",
	"retention",
	"rights",
	"children",
	"changes",
	"contact",
] as const;

export default function PrivacyPage() {
	const t = useTranslations("privacy");

	return (
		<PageLayout>
			<Header showBack title={t("title")} />
			<PageContent>
				<div className="mx-auto max-w-2xl space-y-6 pb-12">
					<p className="text-text-dimmed text-sm">
						{t("lastUpdated")}
					</p>
					<p className="text-text-secondary leading-relaxed">
						{t("intro")}
					</p>
					{SECTION_KEYS.map((key) => (
						<section key={key} className="space-y-2">
							<h2 className="font-semibold text-lg text-text-primary">
								{t(`sections.${key}.title`)}
							</h2>
							<div className="text-text-secondary whitespace-pre-line leading-relaxed text-sm">
								{t(`sections.${key}.content`)}
							</div>
						</section>
					))}
				</div>
			</PageContent>
		</PageLayout>
	);
}
