"use client";

import { useCallback, useEffect, useState } from "react";

export type ReminderFrequency = "daily" | "off" | "weekly";

interface PushState {
	frequency: ReminderFrequency | null;
	isSupported: boolean;
	permissionState: NotificationPermission | null;
	subscribed: boolean;
}

const DEFAULT_STATE: PushState = {
	frequency: null,
	isSupported: false,
	permissionState: null,
	subscribed: false,
};

async function getVapidPublicKey(): Promise<string> {
	const res = await fetch("/api/push/vapid-public-key");
	if (!res.ok) throw new Error("Push notifications not available");
	const data = (await res.json()) as { publicKey: string };
	return data.publicKey;
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = atob(base64);
	const buf = new ArrayBuffer(rawData.length);
	const view = new Uint8Array(buf);
	for (let i = 0; i < rawData.length; i++) {
		view[i] = rawData.charCodeAt(i);
	}
	return buf;
}

export function usePushNotifications(): {
	isLoading: boolean;
	state: PushState;
	subscribe: (frequency: ReminderFrequency) => Promise<boolean>;
	unsubscribe: () => Promise<void>;
	updateFrequency: (frequency: ReminderFrequency) => Promise<void>;
} {
	const [state, setState] = useState<PushState>(DEFAULT_STATE);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const supported =
			typeof window !== "undefined" &&
			"serviceWorker" in navigator &&
			"PushManager" in window &&
			"Notification" in window;

		if (!supported) {
			setState({ ...DEFAULT_STATE, isSupported: false });
			setIsLoading(false);
			return;
		}

		setState((prev) => ({
			...prev,
			isSupported: true,
			permissionState: Notification.permission,
		}));

		// Fetch current server-side subscription state
		fetch("/api/push/subscription")
			.then((r) =>
				r.ok
					? (r.json() as Promise<{
							frequency: ReminderFrequency | null;
							subscribed: boolean;
						}>)
					: null,
			)
			.then((data) => {
				if (data) {
					setState((prev) => ({
						...prev,
						frequency: data.frequency,
						subscribed: data.subscribed,
					}));
				}
			})
			.catch(() => {
				/* not authenticated — ignore */
			})
			.finally(() => setIsLoading(false));
	}, []);

	const subscribe = useCallback(
		async (frequency: ReminderFrequency): Promise<boolean> => {
			if (!state.isSupported) return false;

			const permission = await Notification.requestPermission();
			setState((prev) => ({ ...prev, permissionState: permission }));
			if (permission !== "granted") return false;

			const vapidPublicKey = await getVapidPublicKey();
			const registration = await navigator.serviceWorker.ready;
			const pushSubscription = await registration.pushManager.subscribe({
				applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
				userVisibleOnly: true,
			});

			const { endpoint, keys } = pushSubscription.toJSON() as {
				endpoint: string;
				keys: { auth: string; p256dh: string };
			};

			await fetch("/api/push/subscribe", {
				body: JSON.stringify({
					auth: keys.auth,
					endpoint,
					frequency,
					p256dh: keys.p256dh,
				}),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});

			setState((prev) => ({ ...prev, frequency, subscribed: true }));
			return true;
		},
		[state.isSupported],
	);

	const unsubscribe = useCallback(async (): Promise<void> => {
		const registration = await navigator.serviceWorker.ready;
		const pushSubscription = await registration.pushManager.getSubscription();
		if (pushSubscription) await pushSubscription.unsubscribe();

		await fetch("/api/push/unsubscribe", { method: "DELETE" });
		setState((prev) => ({ ...prev, frequency: null, subscribed: false }));
	}, []);

	const updateFrequency = useCallback(
		async (frequency: ReminderFrequency): Promise<void> => {
			if (frequency === "off") {
				await unsubscribe();
				return;
			}
			// Re-subscribe with new frequency
			await subscribe(frequency);
		},
		[subscribe, unsubscribe],
	);

	return { isLoading, state, subscribe, unsubscribe, updateFrequency };
}
