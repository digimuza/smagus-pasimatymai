"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
	PUSH_PROMPT_DISMISSED_KEY,
	PushNotificationPrompt,
} from "@/components/PushNotificationPrompt";
import { Button, PageContent, PageLayout } from "@/components/ui";
import { useRouter } from "@/i18n/navigation";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { shareSession } from "@/lib/share";

interface SessionResultsClientProps {
	answered: number;
	audience: string;
	locale: string;
	skipped: number;
	superliked: number;
}

export function SessionResultsClient({
	answered,
	audience,
	locale,
	skipped,
	superliked,
}: SessionResultsClientProps): React.ReactElement {
	const t = useTranslations("sessionResults");
	const router = useRouter();
	const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
	const [showPushPrompt, setShowPushPrompt] = useState(false);

	useEffect(() => {
		// Show push prompt once per install, after first session completion
		if (
			typeof window !== "undefined" &&
			!localStorage.getItem(PUSH_PROMPT_DISMISSED_KEY)
		) {
			setShowPushPrompt(true);
		}
	}, []);

	const total = answered + superliked;

	const handleShare = async () => {
		const params = new URLSearchParams({
			answered: String(answered),
			audience,
			skipped: String(skipped),
			superliked: String(superliked),
		});
		const url = `${window.location.origin}/${locale}/session-results?${params.toString()}`;

		const result = await shareSession({
			text: t("shareMessage", { count: total }),
			title: t("shareTitle"),
			url,
		});

		if (result === "copied") {
			setShareStatus("copied");
			setTimeout(() => setShareStatus("idle"), 2500);
		}
	};

	const stats = [
		{ label: t("answered"), value: answered },
		{ label: t("superliked"), value: superliked },
		{ label: t("skipped"), value: skipped },
	];

	return (
		<PageLayout>
			<PushNotificationPrompt
				onDismiss={() => setShowPushPrompt(false)}
				visible={showPushPrompt}
			/>
			<PageContent centered>
				<motion.div
					animate="show"
					className="w-full max-w-sm space-y-8 text-center"
					initial="hidden"
					variants={staggerContainer}
				>
					{/* Heading */}
					<motion.div className="space-y-2" variants={staggerItem}>
						<div className="text-6xl">🎉</div>
						<h1 className="font-light text-3xl text-primary">{t("title")}</h1>
						<p className="text-text-muted">{t("subtitle")}</p>
					</motion.div>

					{/* Stats */}
					<motion.div className="grid grid-cols-3 gap-3" variants={staggerItem}>
						{stats.map(({ label, value }) => (
							<div
								className="rounded-xl bg-background-lighter p-4 text-center"
								key={label}
							>
								<div className="font-semibold text-3xl text-primary">
									{value}
								</div>
								<div className="mt-1 text-text-muted text-xs">{label}</div>
							</div>
						))}
					</motion.div>

					{/* Share */}
					<motion.div className="space-y-3" variants={staggerItem}>
						<Button fullWidth onClick={handleShare} size="lg" variant="primary">
							{shareStatus === "copied" ? t("copied") : t("shareButton")}
						</Button>
						{superliked > 0 && (
							<Button
								fullWidth
								onClick={() => router.push("/awesome")}
								size="lg"
								variant="secondary"
							>
								{t("viewFavorites")}
							</Button>
						)}
						<Button
							fullWidth
							onClick={() => router.push("/game")}
							size="lg"
							variant="ghost"
						>
							{t("playAgain")}
						</Button>
					</motion.div>
				</motion.div>
			</PageContent>
		</PageLayout>
	);
}
