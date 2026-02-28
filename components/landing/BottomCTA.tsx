"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

const FLOATING_HEARTS = [
	{ delay: 0, duration: 4, emoji: "💗", left: "10%", top: "20%" },
	{ delay: 1.2, duration: 3.5, emoji: "💕", left: "85%", top: "30%" },
	{ delay: 2.5, duration: 4.5, emoji: "💘", left: "15%", top: "70%" },
	{ delay: 0.8, duration: 3.8, emoji: "✨", left: "80%", top: "65%" },
];

export function BottomCTA() {
	const t = useTranslations("landing.bottomCta");
	const [isHovered, setIsHovered] = useState(false);

	return (
		<section className="relative py-16 content-auto sm:py-24">
			{/* Floating hearts */}
			{FLOATING_HEARTS.map((heart, i) => (
				<motion.span
					animate={{
						rotate: [0, 5, -5, 0],
						x: [0, 5, -5, 3, 0],
						y: [0, -10, 0, 8, 0],
					}}
					className="pointer-events-none absolute text-lg opacity-40"
					key={i}
					style={{ left: heart.left, top: heart.top }}
					transition={{
						delay: heart.delay,
						duration: heart.duration,
						ease: "easeInOut",
						repeat: Infinity,
					}}
				>
					{heart.emoji}
				</motion.span>
			))}

			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<motion.div
					className="flex flex-col items-center gap-6 text-center"
					initial={{ opacity: 0, y: 30 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					<h2 className="font-bold text-3xl text-text md:text-4xl">
						{t("title")}
					</h2>
					<p className="max-w-md font-light text-lg text-text-muted">
						{t("subtitle")}
					</p>

					<Link
						className="relative w-full max-w-sm"
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
