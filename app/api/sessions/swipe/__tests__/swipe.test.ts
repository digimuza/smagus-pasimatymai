import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
	getAuthPlayer: vi.fn(),
}));

const rateLimitMocks = vi.hoisted(() => ({
	rateLimit: vi.fn(),
}));

const dbMocks = vi.hoisted(() => {
	const state = {
		existingRecord: null as { id: number } | null,
		selectResponses: [] as unknown[],
	};

	const db = {
		insert: vi.fn(() => ({
			values: vi.fn(() => Promise.resolve()),
		})),
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					// used by POST existing-check: .where().limit()
					limit: vi.fn(() =>
						Promise.resolve(state.existingRecord ? [state.existingRecord] : []),
					),
					// used by GET: .where().orderBy().limit()
					orderBy: vi.fn(() => ({
						limit: vi.fn(() => Promise.resolve(state.selectResponses)),
					})),
				})),
			})),
		})),
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				where: vi.fn(() => Promise.resolve()),
			})),
		})),
	};

	return { db, state };
});

vi.mock("@/lib/auth", () => ({
	getAuthPlayer: authMocks.getAuthPlayer,
}));

vi.mock("@/lib/rateLimit", () => ({
	rateLimit: rateLimitMocks.rateLimit,
}));

vi.mock("@/drizzle/db", () => ({ db: dbMocks.db }));

vi.mock("@/drizzle/schema", () => ({
	playerProgress: {
		audience: "playerProgress.audience",
		id: "playerProgress.id",
		playerId: "playerProgress.playerId",
		questionId: "playerProgress.questionId",
		status: "playerProgress.status",
		updatedAt: "playerProgress.updatedAt",
		viewedAt: "playerProgress.viewedAt",
	},
}));

vi.mock("drizzle-orm", () => ({
	and: vi.fn(() => ({ type: "and" })),
	eq: vi.fn(() => ({ type: "eq" })),
}));

import { GET, POST } from "../route";

const BASE_URL = "http://localhost/api/sessions/swipe";
const PLAYER = { email: "player@example.com", id: 42 };

function makePostRequest(body: unknown): NextRequest {
	return new NextRequest(BASE_URL, {
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
		method: "POST",
	});
}

function makeGetRequest(params?: Record<string, string>): NextRequest {
	const url = new URL(BASE_URL);
	if (params) {
		for (const [k, v] of Object.entries(params)) {
			url.searchParams.set(k, v);
		}
	}
	return new NextRequest(url.toString(), { method: "GET" });
}

describe("POST /api/sessions/swipe", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		dbMocks.state.existingRecord = null;
		dbMocks.state.selectResponses = [];
		authMocks.getAuthPlayer.mockResolvedValue(PLAYER);
		rateLimitMocks.rateLimit.mockReturnValue({ remaining: 59, success: true });
	});

	it("returns 401 when player is not authenticated", async () => {
		authMocks.getAuthPlayer.mockResolvedValue(null);
		const req = makePostRequest({
			action: "skip",
			audience: "romantic",
			questionId: 1,
		});
		const res = await POST(req);
		expect(res.status).toBe(401);
		const data = await res.json();
		expect(data.error).toBe("Unauthorized");
	});

	it("returns 429 when the rate limit is exceeded", async () => {
		rateLimitMocks.rateLimit.mockReturnValue({ remaining: 0, success: false });
		const req = makePostRequest({
			action: "skip",
			audience: "romantic",
			questionId: 1,
		});
		const res = await POST(req);
		expect(res.status).toBe(429);
		const data = await res.json();
		expect(data.error).toBe("Too many requests");
	});

	it("returns 400 for an invalid action", async () => {
		const req = makePostRequest({
			action: "invalid-action",
			audience: "romantic",
			questionId: 1,
		});
		const res = await POST(req);
		expect(res.status).toBe(400);
	});

	it("returns 400 when questionId is missing", async () => {
		const req = makePostRequest({ action: "skip", audience: "romantic" });
		const res = await POST(req);
		expect(res.status).toBe(400);
	});

	it("inserts a new progress record when no existing record is found", async () => {
		dbMocks.state.existingRecord = null;
		const req = makePostRequest({
			action: "answer",
			audience: "romantic",
			questionId: 5,
		});
		const res = await POST(req);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(dbMocks.db.insert).toHaveBeenCalled();
		expect(dbMocks.db.update).not.toHaveBeenCalled();
	});

	it("updates an existing progress record instead of inserting a duplicate", async () => {
		dbMocks.state.existingRecord = { id: 99 };
		const req = makePostRequest({
			action: "superlike",
			audience: "romantic",
			questionId: 5,
		});
		const res = await POST(req);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(dbMocks.db.update).toHaveBeenCalled();
		expect(dbMocks.db.insert).not.toHaveBeenCalled();
	});

	it("passes the player id in the rate-limit key", async () => {
		const req = makePostRequest({
			action: "skip",
			audience: "romantic",
			questionId: 1,
		});
		await POST(req);
		expect(rateLimitMocks.rateLimit).toHaveBeenCalledWith(
			`swipe:${PLAYER.id}`,
			{ maxRequests: 60, windowMs: 60_000 },
		);
	});

	it("accepts an optional timestamp", async () => {
		const req = makePostRequest({
			action: "skip",
			audience: "family",
			questionId: 3,
			timestamp: "2026-01-15T10:00:00Z",
		});
		const res = await POST(req);
		expect(res.status).toBe(200);
	});
});

describe("GET /api/sessions/swipe", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		dbMocks.state.selectResponses = [];
		authMocks.getAuthPlayer.mockResolvedValue(PLAYER);
	});

	it("returns 401 when not authenticated", async () => {
		authMocks.getAuthPlayer.mockResolvedValue(null);
		const req = makeGetRequest();
		const res = await GET(req);
		expect(res.status).toBe(401);
		const data = await res.json();
		expect(data.error).toBe("Unauthorized");
	});

	it("returns all responses without an audience filter", async () => {
		dbMocks.state.selectResponses = [
			{
				action: "answered",
				audience: "romantic",
				questionId: 1,
				timestamp: new Date().toISOString(),
			},
			{
				action: "skipped",
				audience: "family",
				questionId: 2,
				timestamp: new Date().toISOString(),
			},
		];
		const req = makeGetRequest();
		const res = await GET(req);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.responses).toHaveLength(2);
		expect(data.seenCount).toBe(2);
	});

	it("returns responses and seenCount when audience filter is applied", async () => {
		dbMocks.state.selectResponses = [
			{
				action: "answered",
				audience: "romantic",
				questionId: 1,
				timestamp: new Date().toISOString(),
			},
		];
		const req = makeGetRequest({ audience: "romantic" });
		const res = await GET(req);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.seenCount).toBe(1);
	});

	it("returns empty array when player has no progress", async () => {
		dbMocks.state.selectResponses = [];
		const req = makeGetRequest();
		const res = await GET(req);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.responses).toHaveLength(0);
		expect(data.seenCount).toBe(0);
	});
});
