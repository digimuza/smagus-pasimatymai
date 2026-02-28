"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const CARD_EMOJIS = ["💜", "🔥", "😏", "✨", "🎵"];

export function AnimatedCard() {
	const t = useTranslations("landing");
	const [index, setIndex] = useState(0);

	const questions = t.raw("sampleQuestions") as string[];

	useEffect(() => {
		const timer = setInterval(() => {
			setIndex((prev) => (prev + 1) % questions.length);
		}, 3000);
		return () => clearInterval(timer);
	}, [questions.length]);

	return (
		<div className="relative mx-auto h-56 w-full max-w-sm">
			<AnimatePresence mode="wait">
				<motion.div
					animate={{
						boxShadow: [
							"0 25px 50px -12px rgba(139, 92, 246, 0.1)",
							"0 25px 50px -12px rgba(139, 92, 246, 0.25)",
							"0 25px 50px -12px rgba(139, 92, 246, 0.1)",
						],
						opacity: 1,
						rotateZ: 0,
						scale: 1,
					}}
					className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-primary/20 bg-gradient-to-br from-background-lighter via-background-light to-background-lighter p-8"
					exit={{ opacity: 0, rotateZ: 5, scale: 0.8, x: 200 }}
					initial={{ opacity: 0, rotateZ: -5, scale: 0.8 }}
					key={index}
					transition={{
						boxShadow: { duration: 2, ease: "easeInOut", repeat: Infinity },
						duration: 0.5,
						ease: "easeInOut",
					}}
				>
					{/* Shimmer border overlay */}
					<motion.div
						animate={{ opacity: [0.3, 0.7, 0.3] }}
						className="absolute inset-0 rounded-3xl border border-primary/30"
						transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
					/>
					<div className="mb-4 text-3xl">
						{CARD_EMOJIS[index % CARD_EMOJIS.length]}
					</div>
					<p className="text-center font-light text-lg text-text leading-relaxed">
						{questions[index]}
					</p>
					<div className="mt-4 flex gap-8 text-sm text-text-dimmed">
						<span className="text-accent">{t("swipeLeft")}</span>
						<span className="text-primary">{t("swipeRight")}</span>
					</div>
				</motion.div>
			</AnimatePresence>

			{/* Stacked cards behind — floating */}
			<motion.div
				animate={{ y: [2, -2, 2] }}
				className="absolute inset-0 -z-10 translate-x-2 rounded-3xl border border-primary/10 bg-background-lighter opacity-40"
				transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
			/>
			<motion.div
				animate={{ y: [4, 0, 4] }}
				className="absolute inset-0 -z-20 translate-x-4 rounded-3xl border border-primary/5 bg-background-lighter opacity-20"
				transition={{
					delay: 0.3,
					duration: 3.5,
					ease: "easeInOut",
					repeat: Infinity,
				}}
			/>
		</div>
	);
}
