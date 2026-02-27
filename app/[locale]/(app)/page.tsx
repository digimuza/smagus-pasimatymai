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
import { BottomCTA } from '@/components/landing/BottomCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

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

  const baseUrl = 'https://santykiuklausimai.lt';

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale === 'lt' ? 'lt_LT' : 'en_US',
      type: 'website',
      url: locale === 'lt' ? baseUrl : `${baseUrl}/${locale}`,
    },
    alternates: {
      languages: {
        lt: baseUrl,
        en: `${baseUrl}/en`,
      },
    },
  };
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <BackgroundGlow />
      <FloatingParticles />
      <LandingNav />

      <main className="flex-1 relative z-10">
        <HeroSection />
        <ModeShowcase />
        <HowItWorks />
        <FeaturesGrid />
        <SocialProof />
        <BottomCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
