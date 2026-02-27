import { useTranslations } from 'next-intl';

export function SocialProof() {
  const t = useTranslations('landing');

  return (
    <section className="py-12 sm:py-16 content-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <p className="text-text-dimmed text-sm italic">
          {t('testimonial')}
        </p>
        <div className="flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-primary text-sm">★</span>
          ))}
        </div>
        <p className="text-text-dimmed/50 text-xs">
          {t('testimonialAuthor')}
        </p>
      </div>
    </section>
  );
}
