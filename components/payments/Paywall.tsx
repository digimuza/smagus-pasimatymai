"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button, Sheet } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

interface PaywallProps {
	isOpen: boolean;
	onClose: () => void;
	trigger?: string;
}

const _FEATURES_FREE = ["50questions", "romanticOnly", "basicCategories"];
const FEATURES_PREMIUM = [
	"allQuestions",
	"allAudiences",
	"spicyCards",
	"progressSync",
	"noAds",
];

export function Paywall({ isOpen, onClose, trigger: _trigger }: PaywallProps) {
	const t = useTranslations("payments");
	const { isAuthenticated } = useAuth();
	const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
		"yearly",
	);
	const [isLoading, setIsLoading] = useState(false);

	const handleCheckout = async () => {
		if (!isAuthenticated) {
			onClose();
			return;
		}

		setIsLoading(true);
		try {
			const res = await fetch("/api/checkout", {
				body: JSON.stringify({ plan: selectedPlan }),
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});

			if (res.ok) {
				const { url } = await res.json();
				if (url) window.location.href = url;
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Sheet isOpen={isOpen} onClose={onClose} side="bottom">
			<div className="mx-auto max-w-md p-6">
				<div className="mb-6 text-center">
					<span className="mb-2 block text-3xl">✨</span>
					<h2 className="font-bold text-2xl text-text">{t("title")}</h2>
					<p className="mt-1 text-sm text-text-muted">{t("subtitle")}</p>
				</div>

				{/* Plan selector */}
				<div className="mb-6 grid grid-cols-2 gap-3">
					<button
						className={`rounded-xl border-2 p-4 text-left transition-all ${
							selectedPlan === "monthly"
								? "border-primary bg-primary/5"
								: "border-primary/10 bg-background-lighter"
						}`}
						onClick={() => setSelectedPlan("monthly")}
						type="button"
					>
						<p className="font-semibold text-text">{t("monthly")}</p>
						<p className="mt-1 font-bold text-primary text-xl">
							{t("monthlyPrice")}
						</p>
						<p className="text-text-dimmed text-xs">{t("perMonth")}</p>
					</button>

					<button
						className={`relative rounded-xl border-2 p-4 text-left transition-all ${
							selectedPlan === "yearly"
								? "border-primary bg-primary/5"
								: "border-primary/10 bg-background-lighter"
						}`}
						onClick={() => setSelectedPlan("yearly")}
						type="button"
					>
						<span className="absolute -top-2 right-2 rounded-full bg-accent px-2 py-0.5 font-bold text-white text-xs">
							{t("savePercent")}
						</span>
						<p className="font-semibold text-text">{t("yearly")}</p>
						<p className="mt-1 font-bold text-primary text-xl">
							{t("yearlyPrice")}
						</p>
						<p className="text-text-dimmed text-xs">{t("perYear")}</p>
					</button>
				</div>

				{/* Features */}
				<div className="mb-6 space-y-2">
					{FEATURES_PREMIUM.map((key) => (
						<div className="flex items-center gap-2" key={key}>
							<span className="text-green-400 text-sm">✓</span>
							<span className="text-sm text-text">{t(`feature.${key}`)}</span>
						</div>
					))}
				</div>

				{/* CTA */}
				<motion.div whileTap={{ scale: 0.97 }}>
					<Button
						disabled={isLoading}
						fullWidth
						onClick={handleCheckout}
						variant="primary"
					>
						{isLoading ? t("processing") : t("startTrial")}
					</Button>
				</motion.div>

				<p className="mt-3 text-center text-text-dimmed text-xs">
					{t("trialNote")}
				</p>
			</div>
		</Sheet>
	);
}
