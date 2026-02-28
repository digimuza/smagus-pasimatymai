"use client";

import type React from "react";
import { useEffect, useState } from "react";

interface SessionDoc {
	audience?: string;
	duration?: number;
	endedAt?: string;
	id: number;
	locale?: string;
	questionsSkipped: number;
	questionsViewed: number;
	sessionId: string;
	spicyCardsViewed: number;
	startedAt: string;
}

interface EventDoc {
	eventType: string;
	questionId: number;
}

interface QuestionDoc {
	id: number;
	question: string;
}

interface TopQuestion {
	count: number;
	questionId: number;
	questionText: string;
}

const StatisticsDashboard: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [totalSessions, setTotalSessions] = useState(0);
	const [todaySessions, setTodaySessions] = useState(0);
	const [weekSessions, setWeekSessions] = useState(0);
	const [avgDuration, setAvgDuration] = useState(0);
	const [audienceDistribution, setAudienceDistribution] = useState<
		Record<string, number>
	>({});
	const [topViewed, setTopViewed] = useState<TopQuestion[]>([]);
	const [topSkipped, setTopSkipped] = useState<TopQuestion[]>([]);
	const [totalEvents, setTotalEvents] = useState(0);

	useEffect(() => {
		async function fetchData() {
			try {
				// Fetch all sessions
				const sessionsRes = await fetch("/api/game-sessions?limit=500");
				const sessionsData = await sessionsRes.json();
				const sessions: SessionDoc[] = sessionsData.docs ?? [];

				setTotalSessions(sessionsData.totalDocs ?? sessions.length);

				// Today / this week counts
				const now = new Date();
				const todayStart = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
				).toISOString();
				const weekStart = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate() - 7,
				).toISOString();

				const todayCount = sessions.filter(
					(s) => s.startedAt >= todayStart,
				).length;
				const weekCount = sessions.filter(
					(s) => s.startedAt >= weekStart,
				).length;
				setTodaySessions(todayCount);
				setWeekSessions(weekCount);

				// Average duration
				const withDuration = sessions.filter((s) => s.startedAt && s.endedAt);
				if (withDuration.length > 0) {
					const totalMs = withDuration.reduce((sum, s) => {
						return (
							sum +
							(new Date(s.endedAt as string).getTime() -
								new Date(s.startedAt).getTime())
						);
					}, 0);
					setAvgDuration(Math.round(totalMs / withDuration.length / 1000));
				}

				// Audience distribution
				const dist: Record<string, number> = {};
				sessions.forEach((s) => {
					const key = s.audience || "unknown";
					dist[key] = (dist[key] || 0) + 1;
				});
				setAudienceDistribution(dist);

				// Fetch events for top questions
				const viewedRes = await fetch(
					"/api/question-events?where[eventType][equals]=viewed&limit=500",
				);
				const viewedData = await viewedRes.json();
				const viewedEvents: EventDoc[] = viewedData.docs ?? [];

				const skippedRes = await fetch(
					"/api/question-events?where[eventType][equals]=skipped&limit=500",
				);
				const skippedData = await skippedRes.json();
				const skippedEvents: EventDoc[] = skippedData.docs ?? [];

				// Count events
				const eventsCountRes = await fetch("/api/question-events?limit=0");
				const eventsCountData = await eventsCountRes.json();
				setTotalEvents(eventsCountData.totalDocs ?? 0);

				// Count by questionId
				const countBy = (events: EventDoc[]) => {
					const map = new Map<number, number>();
					events.forEach((e) => {
						map.set(e.questionId, (map.get(e.questionId) || 0) + 1);
					});
					return Array.from(map.entries())
						.sort((a, b) => b[1] - a[1])
						.slice(0, 20);
				};

				const topViewedIds = countBy(viewedEvents);
				const topSkippedIds = countBy(skippedEvents);

				// Fetch question texts for the top IDs
				const allQuestionIds = new Set([
					...topViewedIds.map(([id]) => id),
					...topSkippedIds.map(([id]) => id),
				]);

				const questionMap = new Map<number, string>();
				if (allQuestionIds.size > 0) {
					const idsParam = Array.from(allQuestionIds)
						.map((id) => `where[id][in]=${id}`)
						.join("&");
					const qRes = await fetch(`/api/questions?${idsParam}&limit=100`);
					const qData = await qRes.json();
					(qData.docs ?? []).forEach((q: QuestionDoc) => {
						questionMap.set(q.id, q.question);
					});
				}

				setTopViewed(
					topViewedIds.map(([id, count]) => ({
						count,
						questionId: id,
						questionText: questionMap.get(id) || `Question #${id}`,
					})),
				);
				setTopSkipped(
					topSkippedIds.map(([id, count]) => ({
						count,
						questionId: id,
						questionText: questionMap.get(id) || `Question #${id}`,
					})),
				);
			} catch (err) {
				console.error("Failed to fetch statistics:", err);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	if (loading) {
		return (
			<div style={{ padding: "20px" }}>
				<p>Loading statistics...</p>
			</div>
		);
	}

	const formatDuration = (seconds: number) => {
		if (seconds < 60) return `${seconds}s`;
		const min = Math.floor(seconds / 60);
		const sec = seconds % 60;
		return `${min}m ${sec}s`;
	};

	const cardStyle: React.CSSProperties = {
		background: "var(--theme-elevation-50)",
		border: "1px solid var(--theme-elevation-150)",
		borderRadius: "8px",
		padding: "20px",
	};

	const tableStyle: React.CSSProperties = {
		borderCollapse: "collapse",
		fontSize: "14px",
		width: "100%",
	};

	const thStyle: React.CSSProperties = {
		borderBottom: "2px solid var(--theme-elevation-150)",
		color: "var(--theme-elevation-500)",
		padding: "8px",
		textAlign: "left",
	};

	const tdStyle: React.CSSProperties = {
		borderBottom: "1px solid var(--theme-elevation-100)",
		padding: "8px",
	};

	return (
		<div style={{ padding: "20px 0" }}>
			<h3 style={{ marginBottom: "16px" }}>Game Statistics</h3>

			{/* Session overview cards */}
			<div
				style={{
					display: "grid",
					gap: "16px",
					gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
					marginBottom: "24px",
				}}
			>
				{[
					{ label: "Total Sessions", value: totalSessions },
					{ label: "Today", value: todaySessions },
					{ label: "This Week", value: weekSessions },
					{ label: "Avg Duration", value: formatDuration(avgDuration) },
					{ label: "Total Events", value: totalEvents },
				].map((item) => (
					<div key={item.label} style={cardStyle}>
						<div style={{ fontSize: "28px", fontWeight: "bold" }}>
							{item.value}
						</div>
						<div
							style={{ color: "var(--theme-elevation-500)", fontSize: "13px" }}
						>
							{item.label}
						</div>
					</div>
				))}
			</div>

			{/* Audience distribution */}
			{Object.keys(audienceDistribution).length > 0 && (
				<div style={{ ...cardStyle, marginBottom: "24px" }}>
					<h4 style={{ marginBottom: "12px" }}>Audience Distribution</h4>
					<table style={tableStyle}>
						<thead>
							<tr>
								<th style={thStyle}>Audience</th>
								<th style={thStyle}>Sessions</th>
								<th style={thStyle}>%</th>
							</tr>
						</thead>
						<tbody>
							{Object.entries(audienceDistribution)
								.sort((a, b) => b[1] - a[1])
								.map(([audience, count]) => (
									<tr key={audience}>
										<td style={tdStyle}>{audience}</td>
										<td style={tdStyle}>{count}</td>
										<td style={tdStyle}>
											{totalSessions > 0
												? Math.round((count / totalSessions) * 100)
												: 0}
											%
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			)}

			{/* Top viewed and skipped in a 2-column grid */}
			<div
				style={{
					display: "grid",
					gap: "16px",
					gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
				}}
			>
				{/* Top Viewed */}
				<div style={cardStyle}>
					<h4 style={{ marginBottom: "12px" }}>Top Viewed Questions</h4>
					{topViewed.length === 0 ? (
						<p
							style={{ color: "var(--theme-elevation-400)", fontSize: "14px" }}
						>
							No data yet
						</p>
					) : (
						<table style={tableStyle}>
							<thead>
								<tr>
									<th style={thStyle}>#</th>
									<th style={thStyle}>Question</th>
									<th style={thStyle}>Views</th>
								</tr>
							</thead>
							<tbody>
								{topViewed.map((q, i) => (
									<tr key={q.questionId}>
										<td style={tdStyle}>{i + 1}</td>
										<td
											style={{
												...tdStyle,
												maxWidth: "300px",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
										>
											{q.questionText}
										</td>
										<td style={tdStyle}>{q.count}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>

				{/* Top Skipped */}
				<div style={cardStyle}>
					<h4 style={{ marginBottom: "12px" }}>Top Skipped Questions</h4>
					{topSkipped.length === 0 ? (
						<p
							style={{ color: "var(--theme-elevation-400)", fontSize: "14px" }}
						>
							No data yet
						</p>
					) : (
						<table style={tableStyle}>
							<thead>
								<tr>
									<th style={thStyle}>#</th>
									<th style={thStyle}>Question</th>
									<th style={thStyle}>Skips</th>
								</tr>
							</thead>
							<tbody>
								{topSkipped.map((q, i) => (
									<tr key={q.questionId}>
										<td style={tdStyle}>{i + 1}</td>
										<td
											style={{
												...tdStyle,
												maxWidth: "300px",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
										>
											{q.questionText}
										</td>
										<td style={tdStyle}>{q.count}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</div>
		</div>
	);
};

export default StatisticsDashboard;
