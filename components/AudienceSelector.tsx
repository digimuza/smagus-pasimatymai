"use client";

import { motion } from "framer-motion";
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

	const handleSelect = (slug: string) => {
		if (!canAccessAudience(slug, subscription)) {
			setShowPaywall(true);
			return;
		}
		setAudience(slug);
		router.push("/game");
	};

	return (
		<PageLayout className="relative overflow-hidden">
			{/* Background glow */}
			<div className="pointer-events-none fixed inset-0">
				<div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
				<div className="absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-accent/5 blur-[80px]" />
			</div>

			{/* Header */}
			<motion.header
				{...fadeInUp}
				className="relative z-10 flex items-center justify-center p-6"
			>
				<div className="flex items-center gap-3">
					<span className="text-3xl">💜</span>
					<span className="font-light text-text-muted text-xl tracking-wide">
						{t("common.appName")}
					</span>
				</div>
			</motion.header>

			{/* Main content */}
			<main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-12">
				<motion.div
					{...fadeInUp}
					className="mb-8 text-center"
					transition={{ delay: 0.2 }}
				>
					<h1 className="mb-3 font-bold text-3xl text-text sm:text-4xl">
						{t("audience.title")}
					</h1>
					<p className="font-light text-lg text-text-muted">
						{t("audience.subtitle")}
					</p>
				</motion.div>

				<div className="grid w-full max-w-md grid-cols-2 gap-4">
					{AUDIENCE_DEFAULTS.map((audience, index) => {
						const locked = !canAccessAudience(audience.slug, subscription);
						return (
							<motion.button
								animate={{ opacity: 1, y: 0 }}
								initial={{ opacity: 0, y: 30 }}
								key={audience.slug}
								transition={staggerDelay(index)}
								{...pressAnimation}
								className="relative flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-background-light p-6 transition-colors hover:border-primary/30"
								onClick={() => handleSelect(audience.slug)}
								style={{ boxShadow: `0 4px 20px ${audience.color}15` }}
							>
								{locked && (
									<span className="absolute top-2 right-2 rounded-full bg-accent/90 px-1.5 py-0.5 font-bold text-[10px] text-white">
										PRO
									</span>
								)}
								<span className="text-5xl">{audience.icon}</span>
								<span className="font-semibold text-lg text-text">
									{t(`audience.${audience.slug}.name`)}
								</span>
								<span className="text-center font-light text-sm text-text-muted leading-snug">
									{t(`audience.${audience.slug}.description`)}
								</span>
							</motion.button>
						);
					})}
				</div>

				{/* Daily question */}
				<motion.div
					{...fadeInUp}
					className="mt-8 w-full max-w-md"
					transition={{ delay: 0.8 }}
				>
					<DailyQuestion audience="romantic" />
				</motion.div>
			</main>

			<Paywall
				isOpen={showPaywall}
				onClose={() => setShowPaywall(false)}
				trigger="audience_locked"
			/>
		</PageLayout>
	);
}
