import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { locales } from '@/i18n/config';

import { BackgroundGlow } from '@/components/landing/BackgroundGlow';
import { FloatingParticles } from '@/components/landing/FloatingParticles';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { ModeShowcase } from '@/components/landing/ModeShowcase';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { SocialProof } from '@/components/landing/SocialProof';
import { FAQ } from '@/components/landing/FAQ';
import { BottomCTA } from '@/components/landing/BottomCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

const BASE_URL = 'https://santykiuklausimai.lt';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale === 'lt' ? 'lt_LT' : 'en_US',
      type: 'website',
      url: locale === 'lt' ? BASE_URL : `${BASE_URL}/${locale}`,
    },
    alternates: {
      canonical: locale === 'lt' ? BASE_URL : `${BASE_URL}/${locale}`,
      languages: {
        lt: BASE_URL,
        en: `${BASE_URL}/en`,
      },
    },
  };
}

async function JsonLd({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t('title'),
    description: t('description'),
    url: locale === 'lt' ? BASE_URL : `${BASE_URL}/${locale}`,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    inLanguage: locale === 'lt' ? 'lt' : 'en',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <JsonLd locale={locale} />
      <BackgroundGlow />
      <FloatingParticles />
      <LandingNav />

      <main className="flex-1 relative z-10">
        <HeroSection />
        <ModeShowcase />
        <HowItWorks />
        <FeaturesGrid />
        <SocialProof />
        <FAQ />
        <BottomCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
