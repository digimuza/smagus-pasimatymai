import { sql } from "drizzle-orm";
import AnalyticsDashboard, {
	type DateRange,
	type QuestionStat,
} from "@/components/admin/AnalyticsDashboard";
import { db } from "@/drizzle/db";

interface SearchParams {
	range?: string;
}

function parseRange(value: string | undefined): DateRange {
	if (value === "7d" || value === "30d") return value;
	return "all";
}

async function getQuestionStats(range: DateRange): Promise<QuestionStat[]> {
	let since: Date | null = null;
	const now = new Date();
	if (range === "7d") {
		since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	} else if (range === "30d") {
		since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
	}

	const dateFilter = since ? sql`AND e.timestamp >= ${since}` : sql``;

	interface Row {
		answers: unknown;
		id: unknown;
		question: unknown;
		skips: unknown;
		superlikes: unknown;
		views: unknown;
	}

	const rows = await db.execute(sql`
		SELECT
			q.id,
			q.question,
			COUNT(CASE WHEN e.event_type = 'viewed'    THEN 1 END)::int AS views,
			COUNT(CASE WHEN e.event_type = 'skipped'   THEN 1 END)::int AS skips,
			COUNT(CASE WHEN e.event_type = 'answered'  THEN 1 END)::int AS answers,
			COUNT(CASE WHEN e.event_type = 'superliked' THEN 1 END)::int AS superlikes
		FROM questions q
		INNER JOIN question_events e ON e.question_id = q.id ${dateFilter}
		WHERE q.status = 'published'
		GROUP BY q.id, q.question
		ORDER BY views DESC
	`);

	return (rows as unknown as Row[]).map((r) => {
		const views = Number(r.views) || 0;
		const skips = Number(r.skips) || 0;
		const answers = Number(r.answers) || 0;
		const superlikes = Number(r.superlikes) || 0;
		return {
			answerRate: views > 0 ? Math.round((answers / views) * 100) : 0,
			answers,
			id: Number(r.id),
			question: String(r.question),
			skipRate: views > 0 ? Math.round((skips / views) * 100) : 0,
			skips,
			superlikes,
			views,
		};
	});
}

export default async function AnalyticsPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const params = await searchParams;
	const range = parseRange(params.range);
	const data = await getQuestionStats(range);

	return <AnalyticsDashboard currentRange={range} data={data} />;
}
