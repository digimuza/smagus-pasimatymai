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
		<div className="fixed inset-x-4 bottom-4 z-50 max-w-md rounded-2xl border border-primary/20 bg-background-light p-5 shadow-lg sm:inset-x-auto sm:right-5">
			<div className="flex flex-col gap-4">
				<p className="text-sm text-text-muted leading-relaxed">
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
						className="flex-1 rounded-xl border border-primary/25 bg-background-lighter px-4 py-2.5 font-medium text-sm text-text transition-colors hover:bg-primary/10"
						onClick={handleReject}
						type="button"
					>
						{t("reject")}
					</button>
					<button
						className="flex-1 rounded-xl bg-primary px-4 py-2.5 font-semibold text-background text-sm transition-colors hover:bg-primary-light"
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
