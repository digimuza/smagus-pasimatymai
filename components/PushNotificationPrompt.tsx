"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const DISMISSED_KEY = "push-prompt-dismissed";

interface PushNotificationPromptProps {
	onDismiss: () => void;
	visible: boolean;
}

export function PushNotificationPrompt({
	visible,
	onDismiss,
}: PushNotificationPromptProps) {
	const t = useTranslations("notifications");
	const { state, subscribe } = usePushNotifications();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedFrequency, setSelectedFrequency] = useState<
		"daily" | "weekly"
	>("daily");

	if (!visible || !state.isSupported || state.subscribed) return null;

	const dismiss = () => {
		localStorage.setItem(DISMISSED_KEY, "1");
		onDismiss();
	};

	const handleEnable = async () => {
		setIsSubmitting(true);
		try {
			await subscribe(selectedFrequency);
		} finally {
			setIsSubmitting(false);
			onDismiss();
		}
	};

	const frequencies: { label: string; value: "daily" | "weekly" }[] = [
		{ label: t("daily"), value: "daily" },
		{ label: t("weekly"), value: "weekly" },
	];

	return (
		<div className="fixed inset-x-0 bottom-0 z-40 border-primary/10 border-t bg-surface p-4 shadow-lg">
			<div className="mx-auto flex max-w-md flex-col gap-4">
				<div className="flex items-start gap-3">
					<span aria-hidden className="text-2xl">
						🔔
					</span>
					<div>
						<p className="font-semibold text-sm text-text">
							{t("promptTitle")}
						</p>
						<p className="mt-0.5 text-sm text-text-muted leading-relaxed">
							{t("promptBody")}
						</p>
					</div>
				</div>

				<div className="flex gap-2">
					{frequencies.map((f) => (
						<button
							className={`flex-1 rounded-lg border-2 py-2 text-sm transition-colors ${
								selectedFrequency === f.value
									? "border-primary bg-primary/10 font-medium text-primary"
									: "border-transparent bg-background-lighter text-text-muted"
							}`}
							key={f.value}
							onClick={() => setSelectedFrequency(f.value)}
							type="button"
						>
							{f.label}
						</button>
					))}
				</div>

				<div className="flex gap-2">
					<button
						className="flex-1 rounded-lg border border-primary/20 px-4 py-2 text-sm text-text-muted transition-colors hover:bg-background-lighter"
						onClick={dismiss}
						type="button"
					>
						{t("later")}
					</button>
					<button
						className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
						disabled={isSubmitting}
						onClick={handleEnable}
						type="button"
					>
						{isSubmitting ? "…" : t("enable")}
					</button>
				</div>
			</div>
		</div>
	);
}

export { DISMISSED_KEY as PUSH_PROMPT_DISMISSED_KEY };
