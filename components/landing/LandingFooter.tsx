import { useTranslations } from 'next-intl';

export function LandingFooter() {
  const t = useTranslations('landing');

  return (
    <footer className="text-center py-8 border-t border-primary/5">
      <p className="text-text-dimmed/40 text-xs">
        {t('footer')}
      </p>
      <p className="text-text-dimmed/30 text-xs mt-2">
        © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
