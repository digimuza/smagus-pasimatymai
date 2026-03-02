"use client";

import { CookieConsent } from "@/components/CookieConsent";
import { AuthProvider } from "@/context/AuthContext";
import { QuestionProvider } from "@/context/QuestionContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<QuestionProvider>
				{children}
				<CookieConsent />
			</QuestionProvider>
		</AuthProvider>
	);
}
