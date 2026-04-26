import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<ImageResponse> {
	const { searchParams } = req.nextUrl;
	const answered = Number(searchParams.get("answered") || "0");
	const superliked = Number(searchParams.get("superliked") || "0");
	const skipped = Number(searchParams.get("skipped") || "0");
	const audience = searchParams.get("audience") || "romantic";
	const locale = searchParams.get("locale") || "en";

	const audienceConfig: Record<string, { gradient: string; icon: string }> = {
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

	const config = audienceConfig[audience] ?? audienceConfig.romantic;
	const total = answered + superliked;

	const headline =
		locale === "lt"
			? `Atsakėme ${total} klausimų! 💜`
			: `We answered ${total} questions! 💜`;

	const labels =
		locale === "lt"
			? { answered: "Atsakyta", skipped: "Praleista", superliked: "Super" }
			: { answered: "Answered", skipped: "Skipped", superliked: "Super" };

	const appName =
		locale === "lt" ? "Santykių Klausimai" : "Relationship Questions";

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
					maxWidth: "90%",
					padding: "48px 64px",
				}}
			>
				<div style={{ display: "flex", fontSize: 56, marginBottom: 20 }}>
					{config.icon}
				</div>
				<div
					style={{
						color: "white",
						display: "flex",
						fontSize: 44,
						fontWeight: 700,
						lineHeight: 1.2,
						marginBottom: 32,
						textAlign: "center",
					}}
				>
					{headline}
				</div>
				<div
					style={{
						display: "flex",
						gap: 32,
						justifyContent: "center",
					}}
				>
					{[
						{ label: labels.answered, value: answered },
						{ label: labels.superliked, value: superliked },
						{ label: labels.skipped, value: skipped },
					].map(({ label, value }) => (
						<div
							key={label}
							style={{
								alignItems: "center",
								background: "rgba(255,255,255,0.15)",
								borderRadius: "16px",
								display: "flex",
								flexDirection: "column",
								padding: "16px 24px",
							}}
						>
							<span
								style={{
									color: "white",
									display: "flex",
									fontSize: 40,
									fontWeight: 700,
								}}
							>
								{value}
							</span>
							<span
								style={{
									color: "rgba(255,255,255,0.75)",
									display: "flex",
									fontSize: 18,
									marginTop: 4,
								}}
							>
								{label}
							</span>
						</div>
					))}
				</div>
			</div>
			<div
				style={{
					bottom: 40,
					color: "rgba(255,255,255,0.8)",
					display: "flex",
					fontSize: 20,
					position: "absolute",
				}}
			>
				{appName}
			</div>
		</div>,
		{ height: 630, width: 1200 },
	);
}
