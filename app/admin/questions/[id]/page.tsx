import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/drizzle/db";
import { questions, categories, questionEvents } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { EditQuestionButton } from "@/components/admin/EditQuestionButton";
import { DeleteQuestionButton } from "@/components/admin/DeleteQuestionButton";

async function getQuestion(id: number) {
	const [row] = await db
		.select({
			id: questions.id,
			question: questions.question,
			audience: questions.audience,
			status: questions.status,
			locale: questions.locale,
			legacyId: questions.legacyId,
			createdAt: questions.createdAt,
			updatedAt: questions.updatedAt,
			categoryId: questions.categoryId,
			categoryName: categories.name,
			categoryType: categories.type,
		})
		.from(questions)
		.leftJoin(categories, eq(questions.categoryId, categories.id))
		.where(eq(questions.id, id))
		.limit(1);

	return row ?? null;
}

async function getStats(questionId: number) {
	const rows = await db
		.select({
			eventType: questionEvents.eventType,
			count: sql<number>`cast(count(*) as int)`,
		})
		.from(questionEvents)
		.where(eq(questionEvents.questionId, questionId))
		.groupBy(questionEvents.eventType);

	return Object.fromEntries(rows.map((r) => [r.eventType, r.count]));
}

const EVENT_LABELS: Record<string, string> = {
	viewed: "Viewed",
	skipped: "Skipped",
	answered: "Answered",
	superliked: "Super-liked",
	spicy_dismissed: "Spicy dismissed",
};

export default async function QuestionDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const questionId = Number(id);
	if (Number.isNaN(questionId)) notFound();

	const [question, stats, allCategories] = await Promise.all([
		getQuestion(questionId),
		getStats(questionId),
		db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(categories.sortOrder),
	]);

	if (!question) notFound();

	const totalEvents = Object.values(stats).reduce((a, b) => a + b, 0);

	return (
		<div className="max-w-2xl">
			<div className="mb-6 flex items-center justify-between">
				<Link
					href="/admin/questions"
					className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
				>
					← Questions
				</Link>
				<div className="flex items-center gap-2">
					<EditQuestionButton
						categories={allCategories}
						question={{
							id: question.id,
							question: question.question,
							categoryId: question.categoryId,
							audience: question.audience,
							status: question.status,
							locale: question.locale ?? "lt",
						}}
					/>
					<DeleteQuestionButton questionId={question.id} redirectAfter />
				</div>
			</div>

			<div className="rounded-lg border border-gray-800 bg-gray-900 p-6 mb-6">
				<div className="flex items-start justify-between gap-4 mb-4">
					<span className="text-xs text-gray-500">#{question.id}</span>
					<div className="flex gap-2">
						<AudienceBadge audience={question.audience} />
						<StatusBadge status={question.status} />
					</div>
				</div>
				<p className="text-lg text-gray-100 leading-relaxed">{question.question}</p>
			</div>

			<div className="grid grid-cols-2 gap-4 mb-6">
				<Field label="Category" value={question.categoryName ?? "—"} />
				<Field label="Category type" value={question.categoryType ?? "—"} />
				<Field label="Locale" value={question.locale ?? "lt"} />
				<Field label="Legacy ID" value={question.legacyId ? String(question.legacyId) : "—"} />
				<Field
					label="Created"
					value={new Date(question.createdAt).toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})}
				/>
				<Field
					label="Updated"
					value={new Date(question.updatedAt).toLocaleDateString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})}
				/>
			</div>

			<div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
				<h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
					Analytics — {totalEvents} total events
				</h2>
				{totalEvents === 0 ? (
					<p className="text-sm text-gray-600">No events recorded yet.</p>
				) : (
					<div className="space-y-3">
						{Object.entries(EVENT_LABELS).map(([key, label]) => {
							const val = stats[key] ?? 0;
							const pct = totalEvents > 0 ? Math.round((val / totalEvents) * 100) : 0;
							return (
								<div key={key}>
									<div className="flex justify-between text-sm mb-1">
										<span className="text-gray-300">{label}</span>
										<span className="text-gray-400">
											{val} <span className="text-gray-600">({pct}%)</span>
										</span>
									</div>
									<div className="h-1.5 rounded-full bg-gray-800">
										<div
											className="h-1.5 rounded-full bg-indigo-500"
											style={{ width: `${pct}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
			<dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</dt>
			<dd className="text-sm text-gray-200">{value}</dd>
		</div>
	);
}

function AudienceBadge({ audience }: { audience: string }) {
	const colors: Record<string, string> = {
		romantic: "bg-pink-900/50 text-pink-300",
		family: "bg-green-900/50 text-green-300",
		kids: "bg-yellow-900/50 text-yellow-300",
		friends: "bg-blue-900/50 text-blue-300",
	};
	return (
		<span
			className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[audience] ?? "bg-gray-800 text-gray-400"}`}
		>
			{audience}
		</span>
	);
}

function StatusBadge({ status }: { status: string }) {
	return (
		<span
			className={`rounded-full px-2 py-0.5 text-xs font-medium ${
				status === "published"
					? "bg-emerald-900/50 text-emerald-300"
					: "bg-gray-800 text-gray-400"
			}`}
		>
			{status}
		</span>
	);
}
