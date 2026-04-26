import { NextResponse } from "next/server";
import { getVapidPublicKey } from "@/lib/push";

export async function GET(): Promise<NextResponse> {
	try {
		const publicKey = getVapidPublicKey();
		return NextResponse.json({ publicKey }, { status: 200 });
	} catch {
		return NextResponse.json(
			{ error: "Push notifications not configured" },
			{ status: 503 },
		);
	}
}
