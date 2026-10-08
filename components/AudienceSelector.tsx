"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { DailyQuestion } from "@/components/DailyQuestion";
import { Paywall } from "@/components/payments/Paywall";
import { PageLayout } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useQuestions } from "@/context/QuestionContext";
import { useRouter } from "@/i18n/navigation";
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
		<PageLayout className="game-atmosphere relative overflow-hidden">
			{/* Header */}
			<header className="relative z-10 flex items-center justify-center px-6 py-8">
				<div className="flex items-center gap-3">
					<span aria-hidden="true" className="text-2xl text-[#f4bca8]">
						♥
					</span>
					<span className="font-serif text-[#e9d2dd] text-xl tracking-wide">
						{t("common.appName")}
					</span>
				</div>
			</header>

			{/* Main content */}
			<main className="relative z-10 flex flex-1 flex-col items-center px-5 pb-12">
				<div className="mb-9 text-center">
					<h1 className="mb-3 font-serif text-4xl text-[#fff3e8] leading-tight sm:text-5xl">
						{t("audience.title")}
					</h1>
					<p className="text-[#d7bdd2] text-base sm:text-lg">
						{t("audience.subtitle")}
					</p>
				</div>

				<div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
					{AUDIENCE_DEFAULTS.map((audience, index) => {
						const locked = !canAccessAudience(audience.slug, subscription);
						return (
							<button
								className={`group relative flex min-h-[235px] flex-col items-start rounded-[1.6rem] border p-5 text-left transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f5c7a9] focus-visible:outline-offset-4 active:border-[#f5c7a9] sm:p-6 ${audience.slug === "romantic" ? "border-[#f5c7a9]/50 bg-[linear-gradient(150deg,#4d2b45,#251729)]" : "border-white/10 bg-[linear-gradient(150deg,#281b33,#1e1428)] hover:border-white/25"}`}
								key={audience.slug}
								onClick={() => handleSelect(audience.slug)}
								style={{ boxShadow: `0 16px 35px ${audience.color}10` }}
								type="button"
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
									className="mt-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl"
								>
									{audience.icon}
								</span>
								<span className="mt-5 font-serif text-2xl text-[#fff2e8]">
									{t(`audience.${audience.slug}.name`)}
								</span>
								<span className="mt-2 text-[#cbb5c8] text-sm leading-snug">
									{t(`audience.${audience.slug}.description`)}
								</span>
							</button>
						);
					})}
				</div>

				{/* Daily question */}
				<div className="mt-8 w-full max-w-lg">
					<DailyQuestion audience="romantic" />
				</div>
			</main>

			<Paywall
				isOpen={showPaywall}
				onClose={() => setShowPaywall(false)}
				trigger="audience_locked"
			/>
		</PageLayout>
	);
}
