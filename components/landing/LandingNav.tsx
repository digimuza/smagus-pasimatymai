"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function LandingNav() {
	const t = useTranslations("landing.nav");

	return (
		<motion.header
			animate={{ opacity: 1, y: 0 }}
			className="sticky top-0 z-50 border-primary/5 border-b bg-background/80 backdrop-blur-md"
			initial={{ opacity: 0, y: -30 }}
			transition={{ delay: 0.2, duration: 0.6 }}
		>
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-3">
					<span className="text-2xl">💜</span>
					<span className="hidden font-light text-lg text-text-muted tracking-wide sm:inline">
						{t("logo")}
					</span>
				</div>
				<LanguageSwitcher />
			</div>
		</motion.header>
	);
}
