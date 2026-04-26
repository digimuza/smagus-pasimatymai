"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { usePairedSessionStatus } from "@/hooks/usePairedSessionStatus";

interface PartnerStatusBadgeProps {
	inviteToken: string;
}

export function PartnerStatusBadge({ inviteToken }: PartnerStatusBadgeProps) {
	const t = useTranslations("game");
	const [minimized, setMinimized] = useState(false);
	const { status } = usePairedSessionStatus(inviteToken);

	const label = status?.partnerFinished
		? t("partnerFinished")
		: status?.partnerOnline
			? t("partnerOnline")
			: t("waitingForPartner");

	const dotActive = status?.partnerOnline || status?.partnerFinished;

	if (minimized) {
		return (
			<button
				aria-label={label}
				className="fixed right-4 bottom-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-background-light shadow-lg"
				onClick={() => setMinimized(false)}
				type="button"
			>
				<span
					className={`h-3 w-3 rounded-full transition-colors ${dotActive ? "bg-primary" : "bg-text-muted"}`}
				/>
			</button>
		);
	}

	return (
		<div
			aria-atomic="true"
			aria-live="polite"
			className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl bg-background-light px-3 py-2 shadow-lg"
		>
			<span
				aria-hidden="true"
				className={`h-2 w-2 flex-shrink-0 rounded-full transition-colors ${dotActive ? "animate-pulse bg-primary" : "bg-text-muted"}`}
			/>
			<span className="text-sm text-text">{label}</span>
			<button
				aria-label="Minimize partner status"
				className="ml-1 text-text-muted transition-colors hover:text-text"
				onClick={() => setMinimized(true)}
				type="button"
			>
				<svg
					aria-hidden="true"
					className="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						d="M20 12H4"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
					/>
				</svg>
			</button>
		</div>
	);
}
