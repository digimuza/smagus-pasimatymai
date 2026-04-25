import Link from "next/link";
import { db } from "@/drizzle/db";
import { questions, categories, questionEvents } from "@/drizzle/schema";
import { NewQuestionButton } from "@/components/admin/NewQuestionButton";
import { eq, like, ilike, and, sql, count, desc } from "drizzle-orm";

const PAGE_SIZE = 50;

type SearchParams = {
	q?: string;
	category?: string;
	audience?: string;
	status?: string;
	page?: string;
};

async function getQuestions(params: SearchParams) {
	const page = Math.max(1, Number(params.page ?? 1));
	const offset = (page - 1) * PAGE_SIZE;

	const filters = [];
	if (params.q) filters.push(ilike(questions.question, `%${params.q}%`));
	if (params.category) filters.push(eq(questions.categoryId, Number(params.category)));
	if (params.audience)
		filters.push(
			eq(
				questions.audience,
				params.audience as "romantic" | "family" | "kids" | "friends",
			),
		);
	if (params.status)
		filters.push(
			eq(questions.status, params.status as "draft" | "published"),
		);

	const where = filters.length ? and(...filters) : undefined;

	const [rows, [{ total }]] = await Promise.all([
		db
			.select({
				id: questions.id,
				question: questions.question,
				audience: questions.audience,
				status: questions.status,
				createdAt: questions.createdAt,
				categoryId: questions.categoryId,
				categoryName: categories.name,
				swipes: sql<number>`cast(coalesce(count(${questionEvents.id}), 0) as int)`,
			})
			.from(questions)
			.leftJoin(categories, eq(questions.categoryId, categories.id))
			.leftJoin(questionEvents, eq(questionEvents.questionId, questions.id))
			.where(where)
			.groupBy(questions.id, categories.name)
			.orderBy(desc(questions.createdAt))
			.limit(PAGE_SIZE)
			.offset(offset),
		db
			.select({ total: count() })
			.from(questions)
			.where(where),
	]);

	return { rows, total: total, page, pages: Math.ceil(total / PAGE_SIZE) };
}

async function getCategories() {
	return db
		.select({ id: categories.id, name: categories.name })
		.from(categories)
		.orderBy(categories.sortOrder);
}

const AUDIENCES = ["romantic", "family", "kids", "friends"] as const;
const STATUSES = ["published", "draft"] as const;

function buildUrl(
	base: SearchParams,
	overrides: Partial<Omit<SearchParams, "page">> & { page?: number },
): string {
	const qs = new URLSearchParams();
	const q = overrides.q ?? base.q;
	const category = overrides.category ?? base.category;
	const audience = overrides.audience ?? base.audience;
	const status = overrides.status ?? base.status;
	const page = overrides.page ?? Number(base.page ?? 1);
	if (q) qs.set("q", q);
	if (category) qs.set("category", category);
	if (audience) qs.set("audience", audience);
	if (status) qs.set("status", status);
	if (page > 1) qs.set("page", String(page));
	const str = qs.toString();
	return `/admin/questions${str ? `?${str}` : ""}`;
}

export default async function AdminQuestionsPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const params = await searchParams;
	const [{ rows, total, page, pages }, allCategories] = await Promise.all([
		getQuestions(params),
		getCategories(),
	]);

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Questions</h1>
					<p className="mt-1 text-sm text-gray-400">{total} total</p>
				</div>
				<NewQuestionButton categories={allCategories} />
			</div>

			{/* Filters */}
			<form method="GET" className="mb-6 flex flex-wrap gap-3">
				<input
					name="q"
					defaultValue={params.q ?? ""}
					placeholder="Search text…"
					className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none w-64"
				/>
				<select
					name="category"
					defaultValue={params.category ?? ""}
					className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
				>
					<option value="">All categories</option>
					{allCategories.map((c) => (
						<option key={c.id} value={String(c.id)}>
							{c.name}
						</option>
					))}
				</select>
				<select
					name="audience"
					defaultValue={params.audience ?? ""}
					className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
				>
					<option value="">All audiences</option>
					{AUDIENCES.map((a) => (
						<option key={a} value={a}>
							{a}
						</option>
					))}
				</select>
				<select
					name="status"
					defaultValue={params.status ?? ""}
					className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
				>
					<option value="">All statuses</option>
					{STATUSES.map((s) => (
						<option key={s} value={s}>
							{s}
						</option>
					))}
				</select>
				<button
					type="submit"
					className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors"
				>
					Filter
				</button>
				{(params.q || params.category || params.audience || params.status) && (
					<a
						href="/admin/questions"
						className="rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
					>
						Clear
					</a>
				)}
			</form>

			{/* Table */}
			<div className="overflow-hidden rounded-lg border border-gray-800">
				<table className="w-full text-sm">
					<thead className="bg-gray-800/50 text-left text-xs uppercase tracking-wider text-gray-400">
						<tr>
							<th className="px-4 py-3 w-12">#</th>
							<th className="px-4 py-3">Question</th>
							<th className="px-4 py-3 w-32">Category</th>
							<th className="px-4 py-3 w-24">Audience</th>
							<th className="px-4 py-3 w-24">Status</th>
							<th className="px-4 py-3 w-20 text-right">Swipes</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-800">
						{rows.length === 0 && (
							<tr>
								<td colSpan={6} className="px-4 py-10 text-center text-gray-500">
									No questions found
								</td>
							</tr>
						)}
						{rows.map((row) => (
							<tr
								key={row.id}
								className="hover:bg-gray-800/40 transition-colors"
							>
								<td className="px-4 py-3 text-gray-500">{row.id}</td>
								<td className="px-4 py-3 max-w-md">
									<Link
										href={`/admin/questions/${row.id}`}
										className="text-gray-200 hover:text-indigo-300 transition-colors line-clamp-2"
									>
										{row.question}
									</Link>
								</td>
								<td className="px-4 py-3 text-gray-400">
									{row.categoryName ?? <span className="text-gray-600">—</span>}
								</td>
								<td className="px-4 py-3">
									<AudienceBadge audience={row.audience} />
								</td>
								<td className="px-4 py-3">
									<StatusBadge status={row.status} />
								</td>
								<td className="px-4 py-3 text-right text-gray-400">
									{row.swipes}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{pages > 1 && (
				<div className="mt-4 flex items-center justify-between text-sm text-gray-400">
					<span>
						Page {page} of {pages}
					</span>
					<div className="flex gap-2">
						{page > 1 && (
							<Link
								href={buildUrl(params, { page: page - 1 })}
								className="rounded-md border border-gray-700 px-3 py-1.5 hover:border-gray-500 transition-colors"
							>
								Previous
							</Link>
						)}
						{page < pages && (
							<Link
								href={buildUrl(params, { page: page + 1 })}
								className="rounded-md border border-gray-700 px-3 py-1.5 hover:border-gray-500 transition-colors"
							>
								Next
							</Link>
						)}
					</div>
				</div>
			)}
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
