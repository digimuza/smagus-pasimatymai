import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const adminMocks = vi.hoisted(() => ({
	requireAdminApi: vi.fn(),
}));

const dbMocks = vi.hoisted(() => {
	const state = {
		deleteReturn: null as Record<string, unknown> | null,
		insertReturn: null as Record<string, unknown> | null,
		updateReturn: null as Record<string, unknown> | null,
	};

	const db = {
		delete: vi.fn(() => ({
			where: vi.fn(() => ({
				returning: vi.fn(() =>
					Promise.resolve(state.deleteReturn ? [state.deleteReturn] : []),
				),
			})),
		})),
		insert: vi.fn(() => ({
			values: vi.fn(() => ({
				returning: vi.fn(() =>
					Promise.resolve(state.insertReturn ? [state.insertReturn] : []),
				),
			})),
		})),
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				where: vi.fn(() => ({
					returning: vi.fn(() =>
						Promise.resolve(state.updateReturn ? [state.updateReturn] : []),
					),
				})),
			})),
		})),
	};

	return { db, state };
});

vi.mock("@/lib/adminAuth", () => ({
	requireAdminApi: adminMocks.requireAdminApi,
}));

vi.mock("@/drizzle/db", () => ({ db: dbMocks.db }));

vi.mock("@/drizzle/schema", () => ({
	questions: { id: "questions.id" },
}));

vi.mock("drizzle-orm", () => ({
	and: vi.fn(() => ({ type: "and" })),
	eq: vi.fn(() => ({ type: "eq" })),
}));

import { DELETE, PATCH } from "../[id]/route";
import { POST } from "../route";

const BASE_URL = "http://localhost/api/admin/questions";

function makeRequest(method: string, url: string, body?: unknown): NextRequest {
	return new NextRequest(url, {
		body: body !== undefined ? JSON.stringify(body) : undefined,
		headers: { "Content-Type": "application/json" },
		method,
	});
}

function makeParams(id: string) {
	return { params: Promise.resolve({ id }) };
}

describe("POST /api/admin/questions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		dbMocks.state.insertReturn = null;
		adminMocks.requireAdminApi.mockResolvedValue(null);
	});

	it("returns 401 when not authenticated", async () => {
		adminMocks.requireAdminApi.mockResolvedValue(
			new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			}),
		);
		const req = makeRequest("POST", BASE_URL, {
			audience: "romantic",
			categoryId: 1,
			question: "Test?",
		});
		const res = await POST(req);
		expect(res.status).toBe(401);
	});

	it("returns 400 for invalid JSON body", async () => {
		const req = new NextRequest(BASE_URL, {
			body: "not-json",
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});
		const res = await POST(req);
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("Invalid JSON");
	});

	it("returns 400 when required fields are missing", async () => {
		const req = makeRequest("POST", BASE_URL, { audience: "romantic" });
		const res = await POST(req);
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBeDefined();
	});

	it("returns 400 when audience is invalid", async () => {
		const req = makeRequest("POST", BASE_URL, {
			audience: "coworkers",
			categoryId: 1,
			question: "Test question?",
		});
		const res = await POST(req);
		expect(res.status).toBe(400);
	});

	it("returns 201 with the created question", async () => {
		const question = {
			audience: "romantic",
			categoryId: 2,
			id: 1,
			locale: "lt",
			question: "What is love?",
			status: "published",
		};
		dbMocks.state.insertReturn = question;

		const req = makeRequest("POST", BASE_URL, {
			audience: "romantic",
			categoryId: 2,
			question: "What is love?",
		});
		const res = await POST(req);
		expect(res.status).toBe(201);
		const data = await res.json();
		expect(data.id).toBe(1);
		expect(data.question).toBe("What is love?");
	});
});

describe("PATCH /api/admin/questions/[id]", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		dbMocks.state.updateReturn = null;
		adminMocks.requireAdminApi.mockResolvedValue(null);
	});

	it("returns 401 when not authenticated", async () => {
		adminMocks.requireAdminApi.mockResolvedValue(
			new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			}),
		);
		const req = makeRequest("PATCH", `${BASE_URL}/1`, { status: "draft" });
		const res = await PATCH(req, makeParams("1"));
		expect(res.status).toBe(401);
	});

	it("returns 400 for a non-numeric ID", async () => {
		const req = makeRequest("PATCH", `${BASE_URL}/abc`, {
			status: "draft",
		});
		const res = await PATCH(req, makeParams("abc"));
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("Invalid ID");
	});

	it("returns 400 for an ID of zero", async () => {
		const req = makeRequest("PATCH", `${BASE_URL}/0`, { status: "draft" });
		const res = await PATCH(req, makeParams("0"));
		expect(res.status).toBe(400);
	});

	it("returns 400 for a validation error", async () => {
		const req = makeRequest("PATCH", `${BASE_URL}/1`, {
			audience: "martians",
		});
		const res = await PATCH(req, makeParams("1"));
		expect(res.status).toBe(400);
	});

	it("returns 404 when the question does not exist", async () => {
		dbMocks.state.updateReturn = null;
		const req = makeRequest("PATCH", `${BASE_URL}/999`, {
			status: "draft",
		});
		const res = await PATCH(req, makeParams("999"));
		expect(res.status).toBe(404);
		const data = await res.json();
		expect(data.error).toBe("Not found");
	});

	it("returns 200 with the updated question", async () => {
		dbMocks.state.updateReturn = {
			id: 5,
			question: "Updated?",
			status: "draft",
		};
		const req = makeRequest("PATCH", `${BASE_URL}/5`, { status: "draft" });
		const res = await PATCH(req, makeParams("5"));
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.id).toBe(5);
		expect(data.status).toBe("draft");
	});
});

describe("DELETE /api/admin/questions/[id]", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		dbMocks.state.deleteReturn = null;
		adminMocks.requireAdminApi.mockResolvedValue(null);
	});

	it("returns 401 when not authenticated", async () => {
		adminMocks.requireAdminApi.mockResolvedValue(
			new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			}),
		);
		const req = makeRequest("DELETE", `${BASE_URL}/3`);
		const res = await DELETE(req, makeParams("3"));
		expect(res.status).toBe(401);
	});

	it("returns 400 for a non-numeric ID", async () => {
		const req = makeRequest("DELETE", `${BASE_URL}/foo`);
		const res = await DELETE(req, makeParams("foo"));
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("Invalid ID");
	});

	it("returns 400 for a negative ID", async () => {
		const req = makeRequest("DELETE", `${BASE_URL}/-1`);
		const res = await DELETE(req, makeParams("-1"));
		expect(res.status).toBe(400);
	});

	it("returns 404 when the question does not exist", async () => {
		dbMocks.state.deleteReturn = null;
		const req = makeRequest("DELETE", `${BASE_URL}/999`);
		const res = await DELETE(req, makeParams("999"));
		expect(res.status).toBe(404);
	});

	it("returns 200 with ok:true on success", async () => {
		dbMocks.state.deleteReturn = { id: 3 };
		const req = makeRequest("DELETE", `${BASE_URL}/3`);
		const res = await DELETE(req, makeParams("3"));
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.ok).toBe(true);
	});
});
