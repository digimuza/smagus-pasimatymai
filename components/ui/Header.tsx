'use client';

import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
}

export function Header({
  title,
  showBack = false,
  backHref = '/game',
  leftAction,
  rightAction,
  className = '',
}: HeaderProps) {
  const router = useRouter();

  const left = leftAction ?? (showBack ? (
    <button
      onClick={() => router.push(backHref)}
      className="text-text-muted hover:text-text transition-colors"
      aria-label="Grįžti"
    >
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  ) : <div className="w-8" />);

  return (
    <header className={`flex items-center justify-between p-6 bg-background-light ${className}`}>
      {left}
      <h1 className="text-2xl font-light text-primary">{title}</h1>
      {rightAction ?? <div className="w-8" />}
    </header>
  );
}
