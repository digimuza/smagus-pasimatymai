import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResultsClient } from "./ResultsClient";

interface ResultsPageProps {
	params: Promise<{ locale: string; token: string }>;
}

export async function generateMetadata({
	params,
}: ResultsPageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "pairingResults" });
	return { title: t("title") };
}

export default async function ResultsPage({
	params,
}: ResultsPageProps): Promise<React.ReactElement> {
	const { token } = await params;
	return <ResultsClient token={token} />;
}
