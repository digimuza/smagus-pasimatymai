import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
	deleteExpiredSubscription,
	getBatchSubscriptions,
	sendPushNotification,
} from "@/lib/push";

const NOTIFICATION_COPY: Record<
	string,
	Record<string, { body: string; title: string }>
> = {
	daily: {
		en: {
			body: "A new question is waiting for you. Take 5 minutes to connect.",
			title: "Time to play! 💜",
		},
		lt: {
			body: "Naujas klausimas laukia jūsų. Skirkite 5 minutes vienas kitam.",
			title: "Laikas žaisti! 💜",
		},
	},
	weekly: {
		en: {
			body: "Your weekly question session is waiting. Reconnect with the ones you love.",
			title: "Weekly reminder 💜",
		},
		lt: {
			body: "Jūsų savaitinis klausimų seansas laukia. Suraskite laiką vienas kitam.",
			title: "Savaitinis priminimas 💜",
		},
	},
};

const sendSchema = z.object({
	frequency: z.enum(["daily", "weekly"]),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
	const cronSecret = process.env.PUSH_CRON_SECRET;
	if (!cronSecret) {
		return NextResponse.json(
			{ error: "Cron secret not configured" },
			{ status: 500 },
		);
	}

	const authHeader = req.headers.get("authorization") ?? "";
	if (authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const parsed = sendSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "frequency must be daily or weekly" },
			{ status: 400 },
		);
	}

	const { frequency } = parsed.data;
	const subscriptions = await getBatchSubscriptions(frequency);

	let sent = 0;
	let failed = 0;
	let cleaned = 0;

	await Promise.allSettled(
		subscriptions.map(async (sub) => {
			const locale = sub.locale === "en" ? "en" : "lt";
			const copy = NOTIFICATION_COPY[frequency][locale];
			try {
				await sendPushNotification(sub, {
					body: copy.body,
					title: copy.title,
					url: "/game",
				});
				sent++;
			} catch (err: unknown) {
				// 410 Gone = subscription expired; clean it up
				if (
					err instanceof Error &&
					"statusCode" in err &&
					(err as { statusCode: number }).statusCode === 410
				) {
					await deleteExpiredSubscription(sub.id);
					cleaned++;
				} else {
					failed++;
				}
			}
		}),
	);

	return NextResponse.json(
		{ cleaned, failed, sent, total: subscriptions.length },
		{ status: 200 },
	);
}
