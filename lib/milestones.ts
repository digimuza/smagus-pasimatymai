export const QUESTION_MILESTONES = [10, 50, 100] as const;
export const STREAK_MILESTONES = [7, 30] as const;

export interface MilestoneHit {
	id: string;
	threshold: number;
	type: "questions" | "streak";
}

export function detectNewMilestones(
	stats: { bestStreak: number; totalAnswered: number },
	seenIds: ReadonlySet<string>,
): MilestoneHit[] {
	const hits: MilestoneHit[] = [];

	for (const n of QUESTION_MILESTONES) {
		const id = `q${n}`;
		if (stats.totalAnswered >= n && !seenIds.has(id)) {
			hits.push({ id, threshold: n, type: "questions" });
		}
	}

	for (const n of STREAK_MILESTONES) {
		const id = `s${n}`;
		if (stats.bestStreak >= n && !seenIds.has(id)) {
			hits.push({ id, threshold: n, type: "streak" });
		}
	}

	return hits;
}
