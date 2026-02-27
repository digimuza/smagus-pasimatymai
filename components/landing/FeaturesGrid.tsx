import { useTranslations } from 'next-intl';

export function FeaturesGrid() {
  const t = useTranslations('landing.features');

  const features = [
    { icon: '🃏', count: t('questions.count'), label: t('questions.label') },
    { icon: '🌶️', count: t('spicy.count'), label: t('spicy.label') },
    { icon: '💕', count: t('categories.count'), label: t('categories.label') },
  ];

  return (
    <section className="py-16 sm:py-20 content-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-md mx-auto">
          {features.map((f) => (
            <div
              key={f.count}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-background-light/50 border border-primary/10 backdrop-blur-sm"
            >
              <span className="text-2xl">{f.icon}</span>
              <span className="text-text font-semibold text-lg">{f.count}</span>
              <span className="text-text-dimmed text-xs">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
