'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

interface ModeCardProps {
  icon: string;
  name: string;
  description: string;
  cta: string;
  colorClass: 'couples' | 'family' | 'friends';
  href: string;
  delay?: number;
}

const colorMap = {
  couples: {
    border: 'border-l-mode-couples',
    glow: 'bg-mode-couples/10',
    button: 'from-mode-couples-dark via-mode-couples to-mode-couples-light',
    shadow: 'shadow-mode-couples/25 hover:shadow-mode-couples/40',
  },
  family: {
    border: 'border-l-mode-family',
    glow: 'bg-mode-family/10',
    button: 'from-mode-family-dark via-mode-family to-mode-family-light',
    shadow: 'shadow-mode-family/25 hover:shadow-mode-family/40',
  },
  friends: {
    border: 'border-l-mode-friends',
    glow: 'bg-mode-friends/10',
    button: 'from-mode-friends-dark via-mode-friends to-mode-friends-light',
    shadow: 'shadow-mode-friends/25 hover:shadow-mode-friends/40',
  },
};

export function ModeCard({ icon, name, description, cta, colorClass, href, delay = 0 }: ModeCardProps) {
  const colors = colorMap[colorClass];

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
    >
      <div className={`relative rounded-2xl bg-background-lighter border-l-[3px] ${colors.border} p-6 sm:p-8 flex flex-col gap-4 overflow-hidden`}>
        {/* Background glow */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 ${colors.glow} rounded-full blur-[60px]`} />

        <div className="relative z-10">
          <span className="text-4xl mb-2 block">{icon}</span>
          <h3 className="text-xl font-semibold text-text mb-2">{name}</h3>
          <p className="text-text-muted text-sm leading-relaxed mb-6">{description}</p>

          <Link href={href}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${colors.button} text-white font-medium text-center text-sm shadow-md ${colors.shadow} transition-shadow`}
            >
              {cta}
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
