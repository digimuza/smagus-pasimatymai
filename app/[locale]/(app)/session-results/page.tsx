import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SessionResultsClient } from "./SessionResultsClient";

interface SessionResultsPageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{
		answered?: string;
		audience?: string;
		skipped?: string;
		superliked?: string;
	}>;
}

export async function generateMetadata({
	params,
	searchParams,
}: SessionResultsPageProps): Promise<Metadata> {
	const { locale } = await params;
	const {
		answered = "0",
		audience = "romantic",
		skipped = "0",
		superliked = "0",
	} = await searchParams;

	const t = await getTranslations({ locale, namespace: "sessionResults" });
	const total = Number(answered) + Number(superliked);
	const title = t("shareTitle");
	const description = t("shareMessage", { count: total });

	const ogUrl = `/api/og-session?answered=${answered}&superliked=${superliked}&skipped=${skipped}&audience=${audience}&locale=${locale}`;

	return {
		description,
		openGraph: {
			description,
			images: [{ height: 630, url: ogUrl, width: 1200 }],
			title,
		},
		title,
		twitter: {
			card: "summary_large_image",
			description,
			images: [ogUrl],
			title,
		},
	};
}

export default async function SessionResultsPage({
	params,
	searchParams,
}: SessionResultsPageProps): Promise<React.ReactElement> {
	const { locale } = await params;
	const {
		answered = "0",
		audience = "romantic",
		skipped = "0",
		superliked = "0",
	} = await searchParams;

	return (
		<SessionResultsClient
			answered={Number(answered)}
			audience={audience}
			locale={locale}
			skipped={Number(skipped)}
			superliked={Number(superliked)}
		/>
	);
}
