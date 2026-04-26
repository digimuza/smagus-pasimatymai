import type { Section } from "@/types";

export const PAGE_SIZE = 50;
export const PREFETCH_THRESHOLD = 10;

export interface PagedQuestion {
	categoryName: string;
	id: number;
	question: string;
}

export interface QuestionPageResult {
	hasMore: boolean;
	questions: PagedQuestion[];
	totalCount: number;
}

export function shouldFetchNextPage(
	availableCount: number,
	hasMore: boolean,
	isFetching: boolean,
): boolean {
	return hasMore && availableCount < PREFETCH_THRESHOLD && !isFetching;
}

export function mergeQuestionsIntoSections(
	sections: Section[],
	incoming: PagedQuestion[],
): Section[] {
	const byName = new Map(
		sections.map((s) => [s.name, { ...s, questions: [...s.questions] }]),
	);

	for (const q of incoming) {
		const sec = byName.get(q.categoryName);
		if (!sec) continue;
		if (sec.questions.some((sq) => sq.id === q.id)) continue;
		sec.questions.push({ id: q.id, question: q.question });
	}

	return sections.map((s) => byName.get(s.name) ?? s);
}
