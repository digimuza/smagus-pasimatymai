import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
	const { searchParams } = req.nextUrl;
	const question = searchParams.get("q") || "Santykių Klausimai";
	const audience = searchParams.get("a") || "romantic";

	const audienceConfig: Record<string, { icon: string; gradient: string }> = {
		family: {
			gradient:
				"linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)",
			icon: "👨‍👩‍👧‍👦",
		},
		friends: {
			gradient:
				"linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)",
			icon: "🍻",
		},
		kids: {
			gradient:
				"linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)",
			icon: "🌈",
		},
		romantic: {
			gradient:
				"linear-gradient(135deg, #6B21A8 0%, #9333EA 50%, #A855F7 100%)",
			icon: "💜",
		},
	};

	const config = audienceConfig[audience] || audienceConfig.romantic;

	return new ImageResponse(
		<div
			style={{
				alignItems: "center",
				background: config.gradient,
				display: "flex",
				flexDirection: "column",
				height: "100%",
				justifyContent: "center",
				padding: "60px",
				width: "100%",
			}}
		>
			<div
				style={{
					alignItems: "center",
					backdropFilter: "blur(10px)",
					background: "rgba(0, 0, 0, 0.3)",
					borderRadius: "32px",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					maxWidth: "90%",
					padding: "48px 56px",
				}}
			>
				<div style={{ display: "flex", fontSize: 64, marginBottom: 24 }}>
					{config.icon}
				</div>
				<div
					style={{
						color: "white",
						display: "flex",
						fontSize: question.length > 80 ? 32 : 40,
						fontWeight: 300,
						lineHeight: 1.4,
						maxWidth: "800px",
						textAlign: "center",
					}}
				>
					{question}
				</div>
			</div>
			<div
				style={{
					alignItems: "center",
					bottom: 40,
					display: "flex",
					gap: 12,
					position: "absolute",
				}}
			>
				<div
					style={{
						color: "rgba(255,255,255,0.8)",
						display: "flex",
						fontSize: 20,
					}}
				>
					Santykių Klausimai
				</div>
			</div>
		</div>,
		{
			height: 630,
			width: 1200,
		},
	);
}
