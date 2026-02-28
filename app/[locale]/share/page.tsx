import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface SharePageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ q?: string; a?: string }>;
}

export async function generateMetadata({
	searchParams,
}: SharePageProps): Promise<Metadata> {
	const { q, a } = await searchParams;
	const question = q || "Santykių Klausimai";
	const audience = a || "romantic";

	const ogUrl = `/api/og?q=${encodeURIComponent(question)}&a=${encodeURIComponent(audience)}`;

	return {
		description:
			"Santykių Klausimai — Pokalbių žaidimas poroms, šeimai ir draugams",
		openGraph: {
			description:
				"Santykių Klausimai — Pokalbių žaidimas poroms, šeimai ir draugams",
			images: [{ height: 630, url: ogUrl, width: 1200 }],
			title: question,
		},
		title: question,
		twitter: {
			card: "summary_large_image",
			description:
				"Santykių Klausimai — Pokalbių žaidimas poroms, šeimai ir draugams",
			images: [ogUrl],
			title: question,
		},
	};
}

export default async function SharePage({ params }: SharePageProps) {
	const { locale } = await params;
	redirect(`/${locale}/audience`);
}
