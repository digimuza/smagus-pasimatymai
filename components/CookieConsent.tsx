"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { getConsentStatus, setConsentStatus } from "@/lib/cookieConsent";

export function CookieConsent() {
	const t = useTranslations("cookieConsent");
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (getConsentStatus() === null) {
			setVisible(true);
		}
	}, []);

	if (!visible) return null;

	const handleAccept = () => {
		setConsentStatus("accepted");
		setVisible(false);
	};

	const handleReject = () => {
		setConsentStatus("rejected");
		setVisible(false);
	};

	return (
		<div className="fixed inset-x-0 bottom-0 z-50 border-primary/10 border-t bg-surface p-4 shadow-lg">
			<div className="mx-auto flex max-w-md flex-col gap-3">
				<p className="text-sm text-text-secondary leading-relaxed">
					{t("message")}{" "}
					<Link
						className="text-primary underline underline-offset-2"
						href="/privacy"
					>
						{t("learnMore")}
					</Link>
				</p>
				<div className="flex gap-2">
					<button
						className="flex-1 rounded-lg border border-primary/20 px-4 py-2 font-medium text-sm text-text-secondary transition-colors hover:bg-surface-elevated"
						onClick={handleReject}
						type="button"
					>
						{t("reject")}
					</button>
					<button
						className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary/90"
						onClick={handleAccept}
						type="button"
					>
						{t("accept")}
					</button>
				</div>
			</div>
		</div>
	);
}
