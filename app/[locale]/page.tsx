import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CookieConsent } from "@/components/CookieConsent";
import { BackgroundGlow } from "@/components/landing/BackgroundGlow";
import { BottomCTA } from "@/components/landing/BottomCTA";
import { FAQ } from "@/components/landing/FAQ";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { ModeShowcase } from "@/components/landing/ModeShowcase";
import { locales } from "@/i18n/config";

const BASE_URL = (
	process.env.NEXT_PUBLIC_URL || "http://localhost:7743"
).replace(/\/$/, "");

export async function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "metadata" });

	return {
		alternates: {
			canonical: locale === "lt" ? BASE_URL : `${BASE_URL}/${locale}`,
			languages: {
				en: `${BASE_URL}/en`,
				lt: BASE_URL,
			},
		},
		description: t("description"),
		openGraph: {
			description: t("description"),
			locale: locale === "lt" ? "lt_LT" : "en_US",
			title: t("title"),
			type: "website",
			url: locale === "lt" ? BASE_URL : `${BASE_URL}/${locale}`,
		},
		title: t("title"),
	};
}

async function JsonLd({ locale }: { locale: string }) {
	const t = await getTranslations({ locale, namespace: "metadata" });

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		applicationCategory: "GameApplication",
		description: t("description"),
		inLanguage: locale === "lt" ? "lt" : "en",
		name: t("title"),
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "EUR",
		},
		operatingSystem: "Any",
		url: locale === "lt" ? BASE_URL : `${BASE_URL}/${locale}`,
	};

	return (
		<script
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			type="application/ld+json"
		/>
	);
}

export default async function LandingPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	return (
		<div className="relative flex min-h-screen flex-col overflow-hidden">
			<JsonLd locale={locale} />
			<BackgroundGlow />
			<LandingNav />

			<main className="relative z-10 flex-1">
				<HeroSection />
				<ModeShowcase />
				<HowItWorks />
				<FAQ />
				<BottomCTA />
			</main>

			<LandingFooter />
			<CookieConsent />
		</div>
	);
}
