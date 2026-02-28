"use client";

import type React from "react";
import { useEffect, useState } from "react";

interface Stats {
	categories: number;
	questions: number;
	spicyCards: number;
	spicyCardTypes: number;
}

const DashboardStats: React.FC = () => {
	const [stats, setStats] = useState<Stats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchStats() {
			try {
				const [questions, categories, spicyCards, spicyCardTypes] =
					await Promise.all([
						fetch("/api/questions?limit=0").then((r) => r.json()),
						fetch("/api/categories?limit=0").then((r) => r.json()),
						fetch("/api/spicy-cards?limit=0").then((r) => r.json()),
						fetch("/api/spicy-card-types?limit=0").then((r) => r.json()),
					]);

				setStats({
					categories: categories.totalDocs ?? 0,
					questions: questions.totalDocs ?? 0,
					spicyCards: spicyCards.totalDocs ?? 0,
					spicyCardTypes: spicyCardTypes.totalDocs ?? 0,
				});
			} catch (err) {
				console.error("Failed to fetch dashboard stats:", err);
			} finally {
				setLoading(false);
			}
		}

		fetchStats();
	}, []);

	if (loading) {
		return (
			<div style={{ padding: "20px" }}>
				<p>Loading stats...</p>
			</div>
		);
	}

	if (!stats) {
		return null;
	}

	const cards = [
		{ count: stats.questions, emoji: "❓", label: "Questions" },
		{ count: stats.categories, emoji: "📂", label: "Categories" },
		{ count: stats.spicyCards, emoji: "🌶️", label: "Spicy Cards" },
		{ count: stats.spicyCardTypes, emoji: "🏷️", label: "Card Types" },
	];

	return (
		<div style={{ padding: "20px 0" }}>
			<h3 style={{ marginBottom: "16px" }}>Content Overview</h3>
			<div
				style={{
					display: "grid",
					gap: "16px",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
				}}
			>
				{cards.map((card) => (
					<div
						key={card.label}
						style={{
							background: "var(--theme-elevation-50)",
							border: "1px solid var(--theme-elevation-150)",
							borderRadius: "8px",
							padding: "20px",
						}}
					>
						<div style={{ fontSize: "28px", marginBottom: "8px" }}>
							{card.emoji}
						</div>
						<div style={{ fontSize: "32px", fontWeight: "bold" }}>
							{card.count}
						</div>
						<div
							style={{ color: "var(--theme-elevation-500)", fontSize: "14px" }}
						>
							{card.label}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default DashboardStats;
