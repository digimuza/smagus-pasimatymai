'use client';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-background ${className}`}>
      {children}
    </div>
  );
}

interface PageContentProps {
  children: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export function PageContent({ children, centered = false, className = '' }: PageContentProps) {
  return (
    <main
      className={`flex-1 overflow-y-auto p-6 ${
        centered ? 'flex flex-col items-center justify-center' : ''
      } ${className}`}
    >
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {children}
      </div>
    </main>
  );
}
