"use client";

import { MotionConfig } from "framer-motion";
import { CookieConsent } from "@/components/CookieConsent";
import { AuthProvider } from "@/context/AuthContext";
import { QuestionProvider } from "@/context/QuestionContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<MotionConfig reducedMotion="user">
			<AuthProvider>
				<QuestionProvider>
					{children}
					<CookieConsent />
				</QuestionProvider>
			</AuthProvider>
		</MotionConfig>
	);
}
