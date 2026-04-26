import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteQuestionButton } from "@/components/admin/DeleteQuestionButton";
import { EditQuestionButton } from "@/components/admin/EditQuestionButton";
import { db } from "@/drizzle/db";
import { categories, questionEvents, questions } from "@/drizzle/schema";

async function getQuestion(id: number) {
	const [row] = await db
		.select({
			audience: questions.audience,
			categoryId: questions.categoryId,
			categoryName: categories.name,
			categoryType: categories.type,
			createdAt: questions.createdAt,
			id: questions.id,
			legacyId: questions.legacyId,
			locale: questions.locale,
			question: questions.question,
			status: questions.status,
			updatedAt: questions.updatedAt,
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
			count: sql<number>`cast(count(*) as int)`,
			eventType: questionEvents.eventType,
		})
		.from(questionEvents)
		.where(eq(questionEvents.questionId, questionId))
		.groupBy(questionEvents.eventType);

	return Object.fromEntries(rows.map((r) => [r.eventType, r.count]));
}

const EVENT_LABELS: Record<string, string> = {
	answered: "Answered",
	skipped: "Skipped",
	spicy_dismissed: "Spicy dismissed",
	superliked: "Super-liked",
	viewed: "Viewed",
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
		db
			.select({ id: categories.id, name: categories.name })
			.from(categories)
			.orderBy(categories.sortOrder),
	]);

	if (!question) notFound();

	const totalEvents = Object.values(stats).reduce((a, b) => a + b, 0);

	return (
		<div className="max-w-2xl">
			<div className="mb-6 flex items-center justify-between">
				<Link
					className="text-gray-500 text-sm transition-colors hover:text-gray-300"
					href="/admin/questions"
				>
					← Questions
				</Link>
				<div className="flex items-center gap-2">
					<EditQuestionButton
						categories={allCategories}
						question={{
							audience: question.audience,
							categoryId: question.categoryId,
							id: question.id,
							locale: question.locale ?? "lt",
							question: question.question,
							status: question.status,
						}}
					/>
					<DeleteQuestionButton questionId={question.id} redirectAfter />
				</div>
			</div>

			<div className="mb-6 rounded-lg border border-gray-800 bg-gray-900 p-6">
				<div className="mb-4 flex items-start justify-between gap-4">
					<span className="text-gray-500 text-xs">#{question.id}</span>
					<div className="flex gap-2">
						<AudienceBadge audience={question.audience} />
						<StatusBadge status={question.status} />
					</div>
				</div>
				<p className="text-gray-100 text-lg leading-relaxed">
					{question.question}
				</p>
			</div>

			<div className="mb-6 grid grid-cols-2 gap-4">
				<Field label="Category" value={question.categoryName ?? "—"} />
				<Field label="Category type" value={question.categoryType ?? "—"} />
				<Field label="Locale" value={question.locale ?? "lt"} />
				<Field
					label="Legacy ID"
					value={question.legacyId ? String(question.legacyId) : "—"}
				/>
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
				<h2 className="mb-4 font-medium text-gray-400 text-sm uppercase tracking-wider">
					Analytics — {totalEvents} total events
				</h2>
				{totalEvents === 0 ? (
					<p className="text-gray-600 text-sm">No events recorded yet.</p>
				) : (
					<div className="space-y-3">
						{Object.entries(EVENT_LABELS).map(([key, label]) => {
							const val = stats[key] ?? 0;
							const pct =
								totalEvents > 0 ? Math.round((val / totalEvents) * 100) : 0;
							return (
								<div key={key}>
									<div className="mb-1 flex justify-between text-sm">
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
			<dt className="mb-1 text-gray-500 text-xs uppercase tracking-wider">
				{label}
			</dt>
			<dd className="text-gray-200 text-sm">{value}</dd>
		</div>
	);
}

function AudienceBadge({ audience }: { audience: string }) {
	const colors: Record<string, string> = {
		family: "bg-green-900/50 text-green-300",
		friends: "bg-blue-900/50 text-blue-300",
		kids: "bg-yellow-900/50 text-yellow-300",
		romantic: "bg-pink-900/50 text-pink-300",
	};
	return (
		<span
			className={`rounded-full px-2 py-0.5 font-medium text-xs ${colors[audience] ?? "bg-gray-800 text-gray-400"}`}
		>
			{audience}
		</span>
	);
}

function StatusBadge({ status }: { status: string }) {
	return (
		<span
			className={`rounded-full px-2 py-0.5 font-medium text-xs ${
				status === "published"
					? "bg-emerald-900/50 text-emerald-300"
					: "bg-gray-800 text-gray-400"
			}`}
		>
			{status}
		</span>
	);
}
