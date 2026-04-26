import { and, count, desc, eq, ilike, sql } from "drizzle-orm";
import Link from "next/link";
import { NewQuestionButton } from "@/components/admin/NewQuestionButton";
import { db } from "@/drizzle/db";
import { categories, questionEvents, questions } from "@/drizzle/schema";
import {
	ADMIN_PAGE_SIZE,
	type AdminQuestionSearchParams,
	buildAdminQuestionsUrl,
	calcTotalPages,
	parseAdminPage,
} from "@/lib/adminBrowse";

type SearchParams = AdminQuestionSearchParams;

async function getQuestions(params: SearchParams) {
	const page = parseAdminPage(params.page);
	const offset = (page - 1) * ADMIN_PAGE_SIZE;

	const filters = [];
	if (params.q) filters.push(ilike(questions.question, `%${params.q}%`));
	if (params.category)
		filters.push(eq(questions.categoryId, Number(params.category)));
	if (params.audience)
		filters.push(
			eq(
				questions.audience,
				params.audience as "romantic" | "family" | "kids" | "friends",
			),
		);
	if (params.status)
		filters.push(eq(questions.status, params.status as "draft" | "published"));

	const where = filters.length ? and(...filters) : undefined;

	const [rows, [{ total }]] = await Promise.all([
		db
			.select({
				audience: questions.audience,
				categoryId: questions.categoryId,
				categoryName: categories.name,
				createdAt: questions.createdAt,
				id: questions.id,
				question: questions.question,
				status: questions.status,
				swipes: sql<number>`cast(coalesce(count(${questionEvents.id}), 0) as int)`,
			})
			.from(questions)
			.leftJoin(categories, eq(questions.categoryId, categories.id))
			.leftJoin(questionEvents, eq(questionEvents.questionId, questions.id))
			.where(where)
			.groupBy(questions.id, categories.name)
			.orderBy(desc(questions.createdAt))
			.limit(ADMIN_PAGE_SIZE)
			.offset(offset),
		db.select({ total: count() }).from(questions).where(where),
	]);

	return { page, pages: calcTotalPages(total), rows, total: total };
}

async function getCategories() {
	return db
		.select({ id: categories.id, name: categories.name })
		.from(categories)
		.orderBy(categories.sortOrder);
}

const AUDIENCES = ["romantic", "family", "kids", "friends"] as const;
const STATUSES = ["published", "draft"] as const;

const buildUrl = buildAdminQuestionsUrl;

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
					<h1 className="font-semibold text-xl">Questions</h1>
					<p className="mt-1 text-gray-400 text-sm">{total} total</p>
				</div>
				<NewQuestionButton categories={allCategories} />
			</div>

			{/* Filters */}
			<form className="mb-6 flex flex-wrap gap-3" method="GET">
				<input
					className="w-64 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
					defaultValue={params.q ?? ""}
					name="q"
					placeholder="Search text…"
				/>
				<select
					className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
					defaultValue={params.category ?? ""}
					name="category"
				>
					<option value="">All categories</option>
					{allCategories.map((c) => (
						<option key={c.id} value={String(c.id)}>
							{c.name}
						</option>
					))}
				</select>
				<select
					className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
					defaultValue={params.audience ?? ""}
					name="audience"
				>
					<option value="">All audiences</option>
					{AUDIENCES.map((a) => (
						<option key={a} value={a}>
							{a}
						</option>
					))}
				</select>
				<select
					className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
					defaultValue={params.status ?? ""}
					name="status"
				>
					<option value="">All statuses</option>
					{STATUSES.map((s) => (
						<option key={s} value={s}>
							{s}
						</option>
					))}
				</select>
				<button
					className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-sm transition-colors hover:bg-indigo-500"
					type="submit"
				>
					Filter
				</button>
				{(params.q || params.category || params.audience || params.status) && (
					<a
						className="rounded-md border border-gray-700 px-4 py-2 text-gray-400 text-sm transition-colors hover:text-white"
						href="/admin/questions"
					>
						Clear
					</a>
				)}
			</form>

			{/* Table */}
			<div className="overflow-hidden rounded-lg border border-gray-800">
				<table className="w-full text-sm">
					<thead className="bg-gray-800/50 text-left text-gray-400 text-xs uppercase tracking-wider">
						<tr>
							<th className="w-12 px-4 py-3">#</th>
							<th className="px-4 py-3">Question</th>
							<th className="w-32 px-4 py-3">Category</th>
							<th className="w-24 px-4 py-3">Audience</th>
							<th className="w-24 px-4 py-3">Status</th>
							<th className="w-20 px-4 py-3 text-right">Swipes</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-800">
						{rows.length === 0 && (
							<tr>
								<td
									className="px-4 py-10 text-center text-gray-500"
									colSpan={6}
								>
									No questions found
								</td>
							</tr>
						)}
						{rows.map((row) => (
							<tr
								className="transition-colors hover:bg-gray-800/40"
								key={row.id}
							>
								<td className="px-4 py-3 text-gray-500">{row.id}</td>
								<td className="max-w-md px-4 py-3">
									<Link
										className="line-clamp-2 text-gray-200 transition-colors hover:text-indigo-300"
										href={`/admin/questions/${row.id}`}
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
				<div className="mt-4 flex items-center justify-between text-gray-400 text-sm">
					<span>
						Page {page} of {pages}
					</span>
					<div className="flex gap-2">
						{page > 1 && (
							<Link
								className="rounded-md border border-gray-700 px-3 py-1.5 transition-colors hover:border-gray-500"
								href={buildUrl(params, { page: page - 1 })}
							>
								Previous
							</Link>
						)}
						{page < pages && (
							<Link
								className="rounded-md border border-gray-700 px-3 py-1.5 transition-colors hover:border-gray-500"
								href={buildUrl(params, { page: page + 1 })}
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
