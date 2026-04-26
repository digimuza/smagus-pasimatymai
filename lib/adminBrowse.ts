export type AdminQuestionSearchParams = {
	q?: string;
	category?: string;
	audience?: string;
	status?: string;
	page?: string;
};

export const ADMIN_PAGE_SIZE = 50;

export function buildAdminQuestionsUrl(
	base: AdminQuestionSearchParams,
	overrides: Partial<Omit<AdminQuestionSearchParams, "page">> & {
		page?: number;
	},
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

export function parseAdminPage(pageParam: string | undefined): number {
	const n = Number(pageParam ?? 1);
	return Number.isNaN(n) || n < 1 ? 1 : Math.floor(n);
}

export function calcTotalPages(
	total: number,
	pageSize = ADMIN_PAGE_SIZE,
): number {
	return Math.ceil(total / pageSize);
}
