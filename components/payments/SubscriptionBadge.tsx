"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { isPremium } from "@/lib/subscription";

export function SubscriptionBadge() {
	const t = useTranslations("payments");
	const { subscription } = useAuth();

	if (!subscription) return null;

	if (isPremium(subscription)) {
		return (
			<span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-2 py-0.5 font-semibold text-white text-xs">
				✨ {t("premiumBadge")}
			</span>
		);
	}

	return (
		<span className="inline-flex items-center gap-1 rounded-full border border-primary/10 bg-background-lighter px-2 py-0.5 text-text-dimmed text-xs">
			{t("freeBadge")}
		</span>
	);
}
