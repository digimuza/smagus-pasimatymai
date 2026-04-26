"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export function PWAInstallPrompt() {
	const t = useTranslations("pwaInstall");
	const [visible, setVisible] = useState(false);
	const [isIOS, setIsIOS] = useState(false);
	const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

	useEffect(() => {
		if (sessionStorage.getItem(DISMISSED_KEY)) return;

		const ua = navigator.userAgent;
		const ios =
			/iphone|ipad|ipod/i.test(ua) &&
			!("MSStream" in window) &&
			!(window.navigator as { standalone?: boolean }).standalone;

		if (ios) {
			setIsIOS(true);
			setVisible(true);
			return;
		}

		const handler = (e: Event) => {
			e.preventDefault();
			deferredPrompt.current = e as BeforeInstallPromptEvent;
			setVisible(true);
		};

		window.addEventListener("beforeinstallprompt", handler);
		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const dismiss = () => {
		sessionStorage.setItem(DISMISSED_KEY, "1");
		setVisible(false);
	};

	const install = async () => {
		if (isIOS) {
			dismiss();
			return;
		}
		if (!deferredPrompt.current) return;
		await deferredPrompt.current.prompt();
		const { outcome } = await deferredPrompt.current.userChoice;
		deferredPrompt.current = null;
		if (outcome === "accepted" || outcome === "dismissed") {
			dismiss();
		}
	};

	if (!visible) return null;

	return (
		<div className="fixed inset-x-0 bottom-0 z-40 border-primary/10 border-t bg-surface p-4 shadow-lg">
			<div className="mx-auto flex max-w-md flex-col gap-3">
				<div className="flex items-start gap-3">
					<span aria-hidden className="text-2xl">
						💜
					</span>
					<div>
						<p className="font-semibold text-sm text-text-primary">
							{t("title")}
						</p>
						<p className="mt-0.5 text-sm text-text-secondary leading-relaxed">
							{isIOS ? t("iosMessage") : t("message")}
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<button
						className="flex-1 rounded-lg border border-primary/20 px-4 py-2 font-medium text-sm text-text-secondary transition-colors hover:bg-surface-elevated"
						onClick={dismiss}
						type="button"
					>
						{t("dismiss")}
					</button>
					{!isIOS && (
						<button
							className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary/90"
							onClick={install}
							type="button"
						>
							{t("install")}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
