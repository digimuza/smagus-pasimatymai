import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JoinSessionForm } from "./JoinSessionForm";

interface JoinPageProps {
	params: Promise<{ locale: string; token: string }>;
}

export async function generateMetadata({
	params,
}: JoinPageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "joinSession" });
	return { title: t("pageTitle") };
}

export default async function JoinPage({
	params,
}: JoinPageProps): Promise<React.ReactElement> {
	const { token } = await params;
	return <JoinSessionForm token={token} />;
}
