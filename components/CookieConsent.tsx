"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { getConsentStatus, setConsentStatus } from "@/lib/cookieConsent";

export function CookieConsent() {
	const t = useTranslations("cookieConsent");
	const [visible, setVisible] = useState(false);
	const firstButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (getConsentStatus() === null) {
			setVisible(true);
		}
	}, []);

	const handleAccept = () => {
		setConsentStatus("accepted");
		setVisible(false);
	};

	const handleReject = useCallback(() => {
		setConsentStatus("rejected");
		setVisible(false);
	}, []);

	useEffect(() => {
		if (!visible) return;
		firstButtonRef.current?.focus();
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") handleReject();
		};
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [visible, handleReject]);

	return (
		<div
			aria-labelledby="cookie-consent-title"
			aria-modal="true"
			className="fixed inset-x-0 bottom-0 z-50 border-primary/10 border-t bg-surface p-4 shadow-lg"
			role="dialog"
		>
			<div className="mx-auto flex max-w-md flex-col gap-3">
				<h2 className="sr-only" id="cookie-consent-title">
					{t("title")}
				</h2>
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
						className="flex-1 rounded-lg border border-primary/20 px-4 py-2 font-medium text-sm text-text-secondary transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						onClick={handleReject}
						ref={firstButtonRef}
						type="button"
					>
						{t("reject")}
					</button>
					<button
						className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
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
