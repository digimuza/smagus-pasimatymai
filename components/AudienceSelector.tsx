"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DailyQuestion } from "@/components/DailyQuestion";
import { Paywall } from "@/components/payments/Paywall";
import { PageLayout } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useQuestions } from "@/context/QuestionContext";
import { useRouter } from "@/i18n/navigation";
import { fadeInUp, pressAnimation, staggerDelay } from "@/lib/animations";
import { canAccessAudience } from "@/lib/subscription";
import { AUDIENCE_DEFAULTS } from "@/types/audience";

export function AudienceSelector() {
	const router = useRouter();
	const t = useTranslations();
	const { setAudience } = useQuestions();
	const { subscription } = useAuth();
	const [showPaywall, setShowPaywall] = useState(false);
	const prefersReducedMotion = useReducedMotion();

	const handleSelect = (slug: string) => {
		if (!canAccessAudience(slug, subscription)) {
			setShowPaywall(true);
			return;
		}
		setAudience(slug);
		router.push("/game");
	};

	return (
		<PageLayout className="game-atmosphere relative overflow-hidden">
			{/* Background glow */}
			<div className="pointer-events-none fixed inset-0">
				<div className="absolute -top-48 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#a65387]/15 blur-[120px]" />
				<div className="absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-[#efaa9b]/10 blur-[80px]" />
			</div>

			{/* Header */}
			<motion.header
				{...fadeInUp}
				className="relative z-10 flex items-center justify-center px-6 py-8"
			>
				<div className="flex items-center gap-3">
					<span aria-hidden="true" className="text-2xl text-[#f4bca8]">
						♥
					</span>
					<span className="font-serif text-[#e9d2dd] text-xl tracking-wide">
						{t("common.appName")}
					</span>
				</div>
			</motion.header>

			{/* Main content */}
			<main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-12">
				<motion.div
					{...fadeInUp}
					className="mb-9 text-center"
					transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2 }}
				>
					<h1 className="mb-3 font-serif text-4xl text-[#fff3e8] leading-tight sm:text-5xl">
						{t("audience.title")}
					</h1>
					<p className="text-[#d7bdd2] text-base sm:text-lg">
						{t("audience.subtitle")}
					</p>
				</motion.div>

				<div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
					{AUDIENCE_DEFAULTS.map((audience, index) => {
						const locked = !canAccessAudience(audience.slug, subscription);
						return (
							<motion.button
								animate={{ opacity: 1, y: 0 }}
								initial={{ opacity: 0, y: 30 }}
								key={audience.slug}
								transition={
									prefersReducedMotion ? { duration: 0 } : staggerDelay(index)
								}
								{...(prefersReducedMotion ? {} : pressAnimation)}
								className={`group relative flex min-h-[235px] flex-col items-start rounded-[1.6rem] border p-5 text-left transition duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f5c7a9] focus-visible:outline-offset-4 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6 ${audience.slug === "romantic" ? "border-[#f5c7a9]/50 bg-[linear-gradient(150deg,#4d2b45,#251729)]" : "border-white/10 bg-[linear-gradient(150deg,#281b33,#1e1428)] hover:border-white/25 motion-reduce:hover:border-white/10"}`}
								onClick={() => handleSelect(audience.slug)}
								style={{ boxShadow: `0 16px 35px ${audience.color}10` }}
							>
								{locked && (
									<span className="absolute top-4 right-4 rounded-full border border-[#f5c7a9]/25 bg-[#f5c7a9]/15 px-2 py-1 font-semibold text-[#f6c9b2] text-[10px] tracking-wide">
										PRO
									</span>
								)}
								<span
									aria-hidden="true"
									className="font-serif text-[#b899aa] text-xs tracking-[0.2em]"
								>
									{String(index + 1).padStart(2, "0")}
								</span>
								<span
									aria-hidden="true"
									className="mt-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl transition-transform group-hover:rotate-[-7deg]"
								>
									{audience.icon}
								</span>
								<span className="mt-5 font-serif text-2xl text-[#fff2e8]">
									{t(`audience.${audience.slug}.name`)}
								</span>
								<span className="mt-2 text-[#cbb5c8] text-sm leading-snug">
									{t(`audience.${audience.slug}.description`)}
								</span>
							</motion.button>
						);
					})}
				</div>

				{/* Daily question */}
				<motion.div
					{...fadeInUp}
					className="mt-8 w-full max-w-lg"
					transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.8 }}
				>
					<DailyQuestion audience="romantic" />
				</motion.div>
			</main>

			<Paywall isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
		</PageLayout>
	);
}
