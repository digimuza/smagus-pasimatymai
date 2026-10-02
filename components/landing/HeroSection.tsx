"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AnimatedCard } from "./AnimatedCard";

export function HeroSection() {
	const t = useTranslations("landing");

	return (
		<section className="romance-hero relative isolate overflow-hidden px-5 pt-14 pb-24 sm:px-8 sm:pt-24 lg:py-32">
			<div aria-hidden="true" className="hero-orbit hero-orbit-one" />
			<div aria-hidden="true" className="hero-orbit hero-orbit-two" />
			<div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					initial={false}
					transition={{ duration: 0.65 }}
				>
					<div className="mb-8 flex items-center gap-3 text-[#f6c7b2] text-xs uppercase tracking-[0.24em]">
						<span aria-hidden="true" className="h-px w-8 bg-[#f6c7b2]/70" />
						{t("eyebrow")}
					</div>
					<h1 className="max-w-3xl font-serif text-[#fff7ef] text-[2.9rem] leading-[0.99] tracking-[-0.045em] lg:text-[clamp(5rem,6.5vw,6.25rem)] min-[360px]:text-[3.45rem]">
						{t("heroTitle1")}{" "}
						<span className="hero-highlight italic">{t("heroHighlight")}</span>{" "}
						{t("heroTitle2")}
					</h1>
					<p className="mt-8 max-w-lg text-[#e7d0df] text-lg leading-relaxed sm:text-xl">
						{t("heroDescription")}
					</p>
					<div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
						<Link
							className="group inline-flex min-h-14 items-center justify-center gap-4 rounded-full bg-[#f5c7a9] px-8 py-4 font-semibold text-[#281827] shadow-[0_16px_40px_rgba(245,165,153,0.23)] transition duration-200 hover:-translate-y-1 hover:bg-[#ffe0c4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
							href="/audience"
						>
							{t("cta")}
							<span
								aria-hidden="true"
								className="text-xl transition-transform group-hover:translate-x-1"
							>
								↗
							</span>
						</Link>
						<span className="text-[#cdb8ca] text-sm">{t("noCta")}</span>
					</div>
				</motion.div>
				<motion.div
					animate={{ opacity: 1, rotate: 0, y: 0 }}
					className="relative mx-auto w-full max-w-md"
					initial={false}
					transition={{ delay: 0.18, duration: 0.7 }}
				>
					<div
						aria-hidden="true"
						className="absolute -inset-9 rounded-full bg-[#ef9b91]/10 blur-[75px]"
					/>
					<div
						aria-hidden="true"
						className="absolute -top-7 right-3 font-serif text-4xl text-[#f6c7b2]"
					>
						✦
					</div>
					<AnimatedCard />
					<p className="mt-10 text-center font-serif text-[#d5b9cb] text-lg italic">
						{t("cardCaption")}
					</p>
				</motion.div>
			</div>
		</section>
	);
}
