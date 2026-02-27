'use client';

import { AuthProvider } from '@/context/AuthContext';
import { QuestionProvider } from '@/context/QuestionContext';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <QuestionProvider>{children}</QuestionProvider>
    </AuthProvider>
  );
}
