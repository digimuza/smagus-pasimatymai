'use client';

import { QuestionProvider } from '@/context/QuestionContext';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QuestionProvider>{children}</QuestionProvider>;
}
