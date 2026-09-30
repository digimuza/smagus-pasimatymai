"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { Button, Sheet } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

interface PaywallProps {
	isOpen: boolean;
	onClose: () => void;
	trigger?: string;
}

const FEATURES_PREMIUM = [
	"allQuestions",
	"allAudiences",
	"spicyCards",
	"progressSync",
	"noAds",
];

export function Paywall({ isOpen, onClose }: PaywallProps) {
	const t = useTranslations("payments");
	const tc = useTranslations("common");
	const { isAuthenticated } = useAuth();
	const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
		"yearly",
	);
	const [isLoading, setIsLoading] = useState(false);
	const [showLogin, setShowLogin] = useState(false);

	const handleCheckout = async () => {
		if (!isAuthenticated) {
			onClose();
			setShowLogin(true);
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
		<>
			<Sheet
				className="!bg-[#21142a]"
				isOpen={isOpen}
				onClose={onClose}
				side="bottom"
			>
				<div className="relative mx-auto max-w-md p-6">
					<button
						aria-label={tc("close")}
						className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#d4bccb] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f5c7a9]"
						onClick={onClose}
						type="button"
					>
						×
					</button>
					<div className="mb-6 text-center">
						<span
							aria-hidden="true"
							className="mb-2 block font-serif text-3xl text-[#f5c7a9]"
						>
							✦
						</span>
						<h2 className="font-serif text-3xl text-[#fff1e7]">{t("title")}</h2>
						<p className="mt-2 text-[#d4bccb] text-sm">{t("subtitle")}</p>
					</div>

					{/* Plan selector */}
					<div className="mb-6 grid grid-cols-2 gap-3">
						<button
							aria-pressed={selectedPlan === "monthly"}
							className={`rounded-2xl border p-4 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f5c7a9] ${
								selectedPlan === "monthly"
									? "border-[#f5c7a9] bg-[#f5c7a9]/10"
									: "border-white/10 bg-white/5"
							}`}
							onClick={() => setSelectedPlan("monthly")}
							type="button"
						>
							<p className="font-semibold text-[#fff1e7]">{t("monthly")}</p>
							<p className="mt-1 font-serif text-2xl text-[#f5c7a9]">
								{t("monthlyPrice")}
							</p>
							<p className="text-[#bfaabb] text-xs">{t("perMonth")}</p>
						</button>

						<button
							aria-pressed={selectedPlan === "yearly"}
							className={`relative rounded-2xl border p-4 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f5c7a9] ${
								selectedPlan === "yearly"
									? "border-[#f5c7a9] bg-[#f5c7a9]/10"
									: "border-white/10 bg-white/5"
							}`}
							onClick={() => setSelectedPlan("yearly")}
							type="button"
						>
							<span className="absolute -top-2 right-2 rounded-full bg-[#f5c7a9] px-2 py-0.5 font-bold text-[#281827] text-xs">
								{t("savePercent")}
							</span>
							<p className="font-semibold text-[#fff1e7]">{t("yearly")}</p>
							<p className="mt-1 font-serif text-2xl text-[#f5c7a9]">
								{t("yearlyPrice")}
							</p>
							<p className="text-[#bfaabb] text-xs">{t("perYear")}</p>
						</button>
					</div>

					{/* Features */}
					<div className="mb-6 space-y-2">
						{FEATURES_PREMIUM.map((key) => (
							<div className="flex items-center gap-2" key={key}>
								<span className="text-[#f5c7a9] text-sm">✓</span>
								<span className="text-[#e9d7e0] text-sm">
									{t(`feature.${key}`)}
								</span>
							</div>
						))}
					</div>

					{/* CTA */}
					<Button
						className="!rounded-full !bg-[#f5c7a9] !text-[#281827] hover:!bg-[#ffe0c4]"
						disabled={isLoading}
						fullWidth
						onClick={handleCheckout}
						variant="primary"
					>
						{isLoading
							? t("processing")
							: isAuthenticated
								? t("startTrial")
								: t("signInToContinue")}
					</Button>

					<p className="mt-3 text-center text-[#bfaabb] text-xs">
						{t("trialNote")}
					</p>
				</div>
			</Sheet>
			<LoginSheet isOpen={showLogin} onClose={() => setShowLogin(false)} />
		</>
	);
}
