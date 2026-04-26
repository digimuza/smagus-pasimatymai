/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

interface PushPayload {
	body: string;
	title: string;
	url?: string;
}

self.addEventListener("push", (event: PushEvent) => {
	if (!event.data) return;

	let data: PushPayload;
	try {
		data = event.data.json() as PushPayload;
	} catch {
		return;
	}

	event.waitUntil(
		self.registration.showNotification(data.title, {
			badge: "/icons/icon-192x192.png",
			body: data.body,
			data: { url: data.url ?? "/" },
			icon: "/icons/icon-192x192.png",
		}),
	);
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
	event.notification.close();
	const url: string = (event.notification.data as { url?: string })?.url ?? "/";

	event.waitUntil(
		self.clients
			.matchAll({ includeUncontrolled: true, type: "window" })
			.then((clients) => {
				for (const client of clients) {
					if (client.url.includes(url) && "focus" in client) {
						return (client as WindowClient).focus();
					}
				}
				if (self.clients.openWindow) {
					return self.clients.openWindow(url);
				}
			}),
	);
});
