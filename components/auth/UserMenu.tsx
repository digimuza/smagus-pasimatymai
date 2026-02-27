'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export function UserMenu() {
  const t = useTranslations('auth');
  const { player, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!player) return null;

  const initials = (player.name || player.email)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
      >
        {player.avatar ? (
          <img src={player.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white text-xs font-semibold">{initials}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-56 bg-background-lighter border border-primary/10 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-primary/10">
              <p className="text-text text-sm font-medium truncate">{player.name || player.email}</p>
              {player.name && (
                <p className="text-text-dimmed text-xs truncate">{player.email}</p>
              )}
            </div>

            <div className="p-1">
              <button
                onClick={() => { router.push('/profile'); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-text hover:bg-background-light rounded-lg transition-colors"
              >
                {t('profile')}
              </button>
              <button
                onClick={async () => { await logout(); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-background-light rounded-lg transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
