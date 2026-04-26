import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { routing } from "@/i18n/routing";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = "https://santykiuklausimai.lt";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "metadata" });

	const url = locale === "lt" ? BASE_URL : `${BASE_URL}/${locale}`;
	const ogLocale = locale === "lt" ? "lt_LT" : "en_US";

	return {
		alternates: {
			canonical: url,
			languages: {
				en: `${BASE_URL}/en`,
				lt: BASE_URL,
			},
		},
		description: t("description"),
		openGraph: {
			description: t("description"),
			images: [{ height: 630, url: "/api/og", width: 1200 }],
			locale: ogLocale,
			title: t("title"),
			type: "website",
			url,
		},
		title: t("title"),
		twitter: {
			card: "summary_large_image",
			description: t("description"),
			images: ["/api/og"],
			title: t("title"),
		},
	};
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
		notFound();
	}

	const messages = await getMessages();

	return (
		<html lang={locale}>
			<body className={inter.className}>
				<NextIntlClientProvider messages={messages}>
					{children}
					<PWAInstallPrompt />
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
