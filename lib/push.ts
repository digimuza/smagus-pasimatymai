import { and, eq } from "drizzle-orm";
import webPush from "web-push";
import { db } from "@/drizzle/db";
import { pushSubscriptions } from "@/drizzle/schema";

export function getVapidPublicKey(): string {
	const key = process.env.VAPID_PUBLIC_KEY;
	if (!key) throw new Error("VAPID_PUBLIC_KEY is not set");
	return key;
}

function initWebPush(): void {
	const publicKey = process.env.VAPID_PUBLIC_KEY;
	const privateKey = process.env.VAPID_PRIVATE_KEY;
	const email = process.env.VAPID_EMAIL ?? "admin@santykiuklausimai.lt";
	if (!publicKey || !privateKey)
		throw new Error("VAPID keys are not configured");
	webPush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
}

export interface PushPayload {
	body: string;
	title: string;
	url: string;
}

export async function sendPushNotification(
	subscription: { auth: string; endpoint: string; p256dh: string },
	payload: PushPayload,
): Promise<void> {
	initWebPush();
	await webPush.sendNotification(
		{
			endpoint: subscription.endpoint,
			keys: { auth: subscription.auth, p256dh: subscription.p256dh },
		},
		JSON.stringify(payload),
	);
}

export async function getBatchSubscriptions(
	frequency: "daily" | "weekly",
): Promise<
	Array<{
		auth: string;
		endpoint: string;
		id: number;
		locale: string;
		p256dh: string;
	}>
> {
	return db
		.select({
			auth: pushSubscriptions.auth,
			endpoint: pushSubscriptions.endpoint,
			id: pushSubscriptions.id,
			locale: pushSubscriptions.locale,
			p256dh: pushSubscriptions.p256dh,
		})
		.from(pushSubscriptions)
		.where(eq(pushSubscriptions.frequency, frequency));
}

export async function deleteExpiredSubscription(id: number): Promise<void> {
	await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, id));
}

export async function getPlayerSubscription(
	playerId: number,
): Promise<{ endpoint: string; frequency: string } | null> {
	const [row] = await db
		.select({
			endpoint: pushSubscriptions.endpoint,
			frequency: pushSubscriptions.frequency,
		})
		.from(pushSubscriptions)
		.where(and(eq(pushSubscriptions.playerId, playerId)))
		.limit(1);
	return row ?? null;
}
