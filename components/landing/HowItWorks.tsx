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
		<section className="bg-[#1b1024] py-20 content-auto sm:py-28">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<motion.h2
					className="mb-14 text-center font-serif text-4xl text-[#fff1e7] md:text-5xl"
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
							className="flex flex-col items-center gap-4 rounded-[1.6rem] border border-white/10 bg-[#23162d] px-7 py-9 text-center"
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
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#f5c7a9]/15 bg-[#f5c7a9]/10 text-3xl">
								{step.icon}
							</div>
							<div className="font-medium text-[#f5c7a9] text-xs tracking-[0.2em]">
								{String(i + 1).padStart(2, "0")}
							</div>
							<h3 className="font-serif text-2xl text-[#fff1e7]">
								{step.title}
							</h3>
							<p className="max-w-xs text-[#cdb9ca] text-sm leading-relaxed">
								{step.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
