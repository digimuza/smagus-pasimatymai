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
		<div className="fixed inset-x-0 bottom-0 z-50 border-t border-primary/10 bg-surface p-4 shadow-lg">
			<div className="mx-auto flex max-w-md flex-col gap-3">
				<p className="text-text-secondary text-sm leading-relaxed">
					{t("message")}{" "}
					<Link
						href="/privacy"
						className="text-primary underline underline-offset-2"
					>
						{t("learnMore")}
					</Link>
				</p>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={handleReject}
						className="flex-1 rounded-lg border border-primary/20 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated"
					>
						{t("reject")}
					</button>
					<button
						type="button"
						onClick={handleAccept}
						className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
					>
						{t("accept")}
					</button>
				</div>
			</div>
		</div>
	);
}
