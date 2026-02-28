"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { AnimatedCard } from "./AnimatedCard";

export function HeroSection() {
	const t = useTranslations("landing");
	const [isHovered, setIsHovered] = useState(false);

	return (
		<section className="relative py-12 sm:py-20 lg:py-28">
			<div className="mx-auto flex max-w-6xl flex-col items-center px-4 sm:px-6 lg:px-8">
				{/* Headline */}
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="mb-4 text-center"
					initial={{ opacity: 0, y: 30 }}
					transition={{ delay: 0.4, duration: 0.7 }}
				>
					<h1 className="mb-2 font-bold text-4xl text-text leading-tight md:text-5xl lg:text-6xl">
						{t("heroTitle1")}{" "}
						<span className="animate-shimmer bg-[length:200%_auto] bg-gradient-to-r from-primary-light via-primary to-accent bg-clip-text text-transparent">
							{t("heroHighlight")}
						</span>
					</h1>
					<h2 className="font-bold text-4xl text-text leading-tight md:text-5xl lg:text-6xl">
						{t("heroTitle2")}
					</h2>
				</motion.div>

				{/* Subtitle */}
				<motion.p
					animate={{ opacity: 1, y: 0 }}
					className="mb-10 max-w-md text-center font-light text-lg text-text-muted leading-relaxed"
					initial={{ opacity: 0, y: 20 }}
					transition={{ delay: 0.7, duration: 0.6 }}
				>
					{t("heroDescription")}
				</motion.p>

				{/* Animated card */}
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="mb-12 w-full"
					initial={{ opacity: 0, y: 40 }}
					transition={{ delay: 0.9, duration: 0.7 }}
				>
					<AnimatedCard />
				</motion.div>

				{/* CTA */}
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="flex w-full max-w-sm flex-col items-center gap-4"
					initial={{ opacity: 0, y: 20 }}
					transition={{ delay: 1.2, duration: 0.6 }}
				>
					<Link
						className="relative w-full"
						href="/audience"
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
					>
						<motion.div
							className="w-full animate-heartbeat rounded-2xl bg-gradient-to-r from-primary-dark via-primary to-accent px-8 py-4 text-center font-semibold text-lg text-white shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/30 hover:shadow-xl"
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
						>
							{t("cta")}
						</motion.div>
						{/* Floating heart on hover */}
						<AnimatePresence>
							{isHovered && (
								<motion.span
									animate={{ opacity: 0, scale: 1, y: -40 }}
									className="pointer-events-none absolute -top-2 right-4 text-xl"
									exit={{ opacity: 0 }}
									initial={{ opacity: 1, scale: 0, y: 0 }}
									transition={{ duration: 0.8, ease: "easeOut" }}
								>
									💗
								</motion.span>
							)}
						</AnimatePresence>
					</Link>
					<p className="font-light text-sm text-text-dimmed">{t("noCta")}</p>
				</motion.div>
			</div>
		</section>
	);
}
