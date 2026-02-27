'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuestions } from '@/context/QuestionContext';
import { AUDIENCE_DEFAULTS } from '@/types/audience';

export function AudienceSelector() {
  const router = useRouter();
  const { setAudience } = useQuestions();

  const handleSelect = (slug: string) => {
    setAudience(slug);
    router.push('/game');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center p-6 relative z-10"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">💜</span>
          <span className="text-xl font-light text-text-muted tracking-wide">Santykių Klausimai</span>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-3">
            Pasirinkite režimą
          </h1>
          <p className="text-text-muted text-lg font-light">
            Kam šiandien žaidžiate?
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {AUDIENCE_DEFAULTS.map((audience, index) => (
            <motion.button
              key={audience.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(audience.slug)}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-background-light border-2 border-transparent hover:border-primary/30 transition-colors"
              style={{
                boxShadow: `0 4px 20px ${audience.color}15`,
              }}
            >
              <span className="text-5xl">{audience.icon}</span>
              <span className="text-text font-semibold text-lg">{audience.name}</span>
              <span className="text-text-muted text-sm font-light text-center leading-snug">
                {audience.description}
              </span>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
