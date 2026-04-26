"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { usePairedSessionStatus } from "@/hooks/usePairedSessionStatus";

interface InvitePartnerButtonProps {
	audience: string;
	pairedSessionId?: string;
}

type InviteState = "idle" | "generating" | "ready" | "connected";

export function InvitePartnerButton({
	audience,
	pairedSessionId: initialPairedSessionId,
}: InvitePartnerButtonProps) {
	const t = useTranslations("game");
	const [inviteState, setInviteState] = useState<InviteState>(
		initialPairedSessionId ? "ready" : "idle",
	);
	const [inviteToken, setInviteToken] = useState<string | null>(null);
	const [inviteUrl, setInviteUrl] = useState<string | null>(null);
	const [copySuccess, setCopySuccess] = useState(false);

	const { status } = usePairedSessionStatus(
		inviteState === "ready" ? inviteToken : null,
	);

	useEffect(() => {
		if (status?.partnerJoined && inviteState === "ready") {
			setInviteState("connected");
		}
	}, [status?.partnerJoined, inviteState]);

	const shareOrCopy = async (url: string) => {
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({ url });
				return;
			} catch {
				// User cancelled or Web Share API unavailable; fall through to clipboard
			}
		}
		if (typeof navigator !== "undefined" && navigator.clipboard) {
			await navigator.clipboard.writeText(url);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		}
	};

	const handleClick = async () => {
		if (inviteState === "connected" || inviteState === "generating") return;

		if (inviteState === "ready" && inviteUrl) {
			await shareOrCopy(inviteUrl);
			return;
		}

		setInviteState("generating");

		try {
			const res = await fetch("/api/sessions/pair", {
				body: JSON.stringify({ audience }),
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});

			if (!res.ok) throw new Error("Failed to create pair session");

			const data: { inviteToken: string; inviteUrl: string } = await res.json();
			setInviteToken(data.inviteToken);
			setInviteUrl(data.inviteUrl);
			setInviteState("ready");

			await shareOrCopy(data.inviteUrl);
		} catch {
			setInviteState("idle");
		}
	};

	if (inviteState === "connected") {
		return (
			<div className="inline-flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-3 font-medium text-primary text-sm">
				<span aria-hidden="true">✓</span>
				<span>{t("partnerConnected")}</span>
			</div>
		);
	}

	const label = copySuccess
		? "✓ Copied!"
		: inviteState === "ready"
			? t("waitingForPartner")
			: t("invitePartner");

	return (
		<Button
			loading={inviteState === "generating"}
			onClick={handleClick}
			type="button"
			variant="secondary"
		>
			{label}
		</Button>
	);
}
