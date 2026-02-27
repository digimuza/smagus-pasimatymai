import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface SharePageProps {
  searchParams: Promise<{ q?: string; a?: string }>;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ searchParams }: SharePageProps): Promise<Metadata> {
  const { q, a } = await searchParams;
  const question = q || 'Santykių Klausimai';
  const audience = a || 'romantic';

  const ogUrl = `/api/og?q=${encodeURIComponent(question)}&a=${encodeURIComponent(audience)}`;

  return {
    title: question,
    description: 'Santykių Klausimai — Pokalbių žaidimas poroms, šeimai ir draugams',
    openGraph: {
      title: question,
      description: 'Santykių Klausimai — Pokalbių žaidimas poroms, šeimai ir draugams',
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: question,
      description: 'Santykių Klausimai — Pokalbių žaidimas poroms, šeimai ir draugams',
      images: [ogUrl],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { locale } = await params;
  redirect(`/${locale}/audience`);
}
