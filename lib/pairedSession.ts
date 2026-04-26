import { randomBytes } from "crypto";

export function generateInviteToken(): string {
	return randomBytes(8).toString("base64url");
}

export function buildInviteUrl(token: string): string {
	const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:7743";
	return `${base}/join/${token}`;
}

export function isTokenExpired(expiresAt: Date): boolean {
	return expiresAt < new Date();
}

export type ProgressStatus = "answered" | "skipped" | "superliked";

export interface ResultCard {
	myStatus: ProgressStatus;
	partnerStatus: ProgressStatus;
	questionId: number;
	questionText: string | null;
}

export interface ResultsPayload {
	agreed: ResultCard[];
	bothSkipped: ResultCard[];
	disagreed: ResultCard[];
}

interface ProgressRow {
	questionId: number;
	status: ProgressStatus;
}

interface QuestionRow {
	id: number;
	question: string;
}

export function computeResults(
	myProgress: ProgressRow[],
	partnerProgress: ProgressRow[],
	questions: QuestionRow[],
): ResultsPayload {
	const partnerMap = new Map(
		partnerProgress.map((r) => [r.questionId, r.status]),
	);
	const questionMap = new Map(questions.map((q) => [q.id, q.question]));

	const agreed: ResultCard[] = [];
	const disagreed: ResultCard[] = [];
	const bothSkipped: ResultCard[] = [];

	for (const { questionId, status: myStatus } of myProgress) {
		const partnerStatus = partnerMap.get(questionId);
		if (!partnerStatus) continue;

		const card: ResultCard = {
			myStatus,
			partnerStatus,
			questionId,
			questionText: questionMap.get(questionId) ?? null,
		};

		const myPositive = myStatus !== "skipped";
		const partnerPositive = partnerStatus !== "skipped";

		if (myPositive && partnerPositive) {
			agreed.push(card);
		} else if (!myPositive && !partnerPositive) {
			bothSkipped.push(card);
		} else {
			disagreed.push(card);
		}
	}

	return { agreed, bothSkipped, disagreed };
}
