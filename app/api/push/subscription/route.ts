import { type NextRequest, NextResponse } from "next/server";
import { getAuthPlayer } from "@/lib/auth";
import { getPlayerSubscription } from "@/lib/push";

export async function GET(req: NextRequest): Promise<NextResponse> {
	const player = await getAuthPlayer(req.headers);
	if (!player) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const subscription = await getPlayerSubscription(player.id);

	return NextResponse.json(
		subscription
			? { frequency: subscription.frequency, subscribed: true }
			: { frequency: null, subscribed: false },
		{ status: 200 },
	);
}
