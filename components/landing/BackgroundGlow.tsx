'use client';

export function BackgroundGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-primary-dark/8 rounded-full blur-[80px]" />
    </div>
  );
}
