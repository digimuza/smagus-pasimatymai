"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const STEP_ICONS = ["🎯", "👆", "💬"];

export function HowItWorks() {
	const t = useTranslations("landing.howItWorks");

	const steps = [
		{
			description: t("step1.description"),
			icon: STEP_ICONS[0],
			title: t("step1.title"),
		},
		{
			description: t("step2.description"),
			icon: STEP_ICONS[1],
			title: t("step2.title"),
		},
		{
			description: t("step3.description"),
			icon: STEP_ICONS[2],
			title: t("step3.title"),
		},
	];

	return (
		<section className="bg-background-light/30 py-16 content-auto sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<motion.h2
					className="mb-12 text-center font-bold text-3xl text-text md:text-4xl"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					{t("title")}
				</motion.h2>

				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					{steps.map((step, i) => (
						<motion.div
							className="flex flex-col items-center gap-4 text-center"
							initial={{ opacity: 0, y: 30 }}
							key={i}
							transition={{
								bounce: 0.4,
								delay: i * 0.15,
								duration: 0.5,
								type: "spring",
							}}
							viewport={{ margin: "-50px", once: true }}
							whileInView={{ opacity: 1, y: 0 }}
						>
							<motion.div
								animate={{ y: [0, -4, 0] }}
								className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/10 bg-background-lighter text-3xl"
								transition={{
									delay: i * 0.5,
									duration: 3,
									ease: "easeInOut",
									repeat: Infinity,
								}}
							>
								{step.icon}
							</motion.div>
							<div className="font-medium text-primary text-sm">
								{String(i + 1).padStart(2, "0")}
							</div>
							<h3 className="font-semibold text-lg text-text">{step.title}</h3>
							<p className="max-w-xs text-sm text-text-muted leading-relaxed">
								{step.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
