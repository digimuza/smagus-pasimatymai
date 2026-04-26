import { describe, expect, it } from "vitest";
import {
	ADMIN_PAGE_SIZE,
	buildAdminQuestionsUrl,
	calcTotalPages,
	parseAdminPage,
} from "../adminBrowse";

// ---------------------------------------------------------------------------
// buildAdminQuestionsUrl
// ---------------------------------------------------------------------------
describe("buildAdminQuestionsUrl", () => {
	it("returns base path with no params", () => {
		expect(buildAdminQuestionsUrl({}, {})).toBe("/admin/questions");
	});

	it("includes search query from base", () => {
		expect(buildAdminQuestionsUrl({ q: "love" }, {})).toBe(
			"/admin/questions?q=love",
		);
	});

	it("override replaces base query", () => {
		expect(buildAdminQuestionsUrl({ q: "old" }, { q: "new" })).toBe(
			"/admin/questions?q=new",
		);
	});

	it("omits page=1 from URL", () => {
		expect(buildAdminQuestionsUrl({}, { page: 1 })).toBe("/admin/questions");
	});

	it("includes page when > 1", () => {
		expect(buildAdminQuestionsUrl({}, { page: 2 })).toBe(
			"/admin/questions?page=2",
		);
	});

	it("preserves base filters when advancing page", () => {
		const url = buildAdminQuestionsUrl(
			{ audience: "romantic", q: "love" },
			{ page: 3 },
		);
		expect(url).toBe("/admin/questions?q=love&audience=romantic&page=3");
	});

	it("combines all filter overrides", () => {
		const url = buildAdminQuestionsUrl(
			{},
			{
				audience: "family",
				category: "5",
				q: "hello",
				status: "published",
			},
		);
		expect(url).toBe(
			"/admin/questions?q=hello&category=5&audience=family&status=published",
		);
	});

	it("clears a base param when override is empty string", () => {
		// empty string is falsy — param is omitted
		const url = buildAdminQuestionsUrl({ q: "old" }, { q: "" });
		expect(url).toBe("/admin/questions");
	});

	it("retains category and status without search query", () => {
		const url = buildAdminQuestionsUrl(
			{ category: "3", status: "draft" },
			{ page: 2 },
		);
		expect(url).toBe("/admin/questions?category=3&status=draft&page=2");
	});
});

// ---------------------------------------------------------------------------
// parseAdminPage
// ---------------------------------------------------------------------------
describe("parseAdminPage", () => {
	it("returns 1 when param is undefined", () => {
		expect(parseAdminPage(undefined)).toBe(1);
	});

	it("returns 1 for zero", () => {
		expect(parseAdminPage("0")).toBe(1);
	});

	it("returns 1 for negative values", () => {
		expect(parseAdminPage("-5")).toBe(1);
	});

	it("parses a valid page number", () => {
		expect(parseAdminPage("3")).toBe(3);
	});

	it("returns 1 for non-numeric strings", () => {
		expect(parseAdminPage("abc")).toBe(1);
	});

	it("returns 1 for empty string", () => {
		expect(parseAdminPage("")).toBe(1);
	});
});

// ---------------------------------------------------------------------------
// calcTotalPages
// ---------------------------------------------------------------------------
describe("calcTotalPages", () => {
	it("returns 0 for zero total", () => {
		expect(calcTotalPages(0)).toBe(0);
	});

	it("returns 1 for total equal to PAGE_SIZE", () => {
		expect(calcTotalPages(ADMIN_PAGE_SIZE)).toBe(1);
	});

	it("returns 2 when total exceeds PAGE_SIZE by 1", () => {
		expect(calcTotalPages(ADMIN_PAGE_SIZE + 1)).toBe(2);
	});

	it("rounds up correctly for partial last page", () => {
		expect(calcTotalPages(75, 50)).toBe(2);
		expect(calcTotalPages(51, 50)).toBe(2);
		expect(calcTotalPages(50, 50)).toBe(1);
	});

	it("handles custom page size", () => {
		expect(calcTotalPages(100, 25)).toBe(4);
	});

	it("returns 1 for total smaller than page size", () => {
		expect(calcTotalPages(10, 50)).toBe(1);
	});
});
