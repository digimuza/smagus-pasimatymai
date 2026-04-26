// @vitest-environment node
// WHY: jose uses Web Crypto via TextEncoder; Uint8Array instanceof checks fail
// across jsdom's realm boundary. Node environment avoids the mismatch.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// WHY: db must be mocked before the auth module is imported so Drizzle never
// tries to open a real Postgres connection in the jsdom test environment.
const dbMocks = vi.hoisted(() => {
	const limitFn = vi.fn();
	return {
		db: {
			select: vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: limitFn,
					}),
				}),
			}),
		},
		limitFn,
	};
});

vi.mock("@/drizzle/db", () => ({ db: dbMocks.db }));

import { COOKIE_NAME, getAuthPlayer, signToken, verifyToken } from "../auth";

describe("COOKIE_NAME", () => {
	it("equals 'auth-token'", () => {
		expect(COOKIE_NAME).toBe("auth-token");
	});
});

// ---------------------------------------------------------------------------
// signToken + verifyToken
// ---------------------------------------------------------------------------
describe("signToken / verifyToken roundtrip", () => {
	it("produces a non-empty JWT string", async () => {
		const token = await signToken(1, "a@b.com");
		expect(typeof token).toBe("string");
		expect(token.length).toBeGreaterThan(0);
	});

	it("roundtrip preserves id and email", async () => {
		const token = await signToken(42, "test@example.com");
		const { id, email } = await verifyToken(token);
		expect(id).toBe(42);
		expect(email).toBe("test@example.com");
	});

	it("roundtrip works for id = 0 (edge case)", async () => {
		const token = await signToken(0, "zero@example.com");
		const { id, email } = await verifyToken(token);
		expect(id).toBe(0);
		expect(email).toBe("zero@example.com");
	});
});

describe("verifyToken — invalid inputs", () => {
	it("throws on a completely malformed token", async () => {
		await expect(verifyToken("not-a-jwt")).rejects.toThrow();
	});

	it("throws on an empty string", async () => {
		await expect(verifyToken("")).rejects.toThrow();
	});

	it("throws on a token signed with a different secret", async () => {
		const { SignJWT } = await import("jose");
		const otherSecret = new TextEncoder().encode(
			"other-secret-min-32-characters-here!!",
		);
		const foreignToken = await new SignJWT({
			email: "evil@hack.com",
			sub: "99",
		})
			.setProtectedHeader({ alg: "HS256" })
			.setExpirationTime("30d")
			.setIssuedAt()
			.sign(otherSecret);
		await expect(verifyToken(foreignToken)).rejects.toThrow();
	});

	it("throws on an expired token", async () => {
		const { SignJWT } = await import("jose");
		const secret = new TextEncoder().encode(
			"dev-fallback-secret-min-32-chars!!",
		);
		const now = Math.floor(Date.now() / 1000);
		// WHY: setExpirationTime with a number is treated as absolute Unix time,
		// so passing now-5 guarantees exp is already in the past.
		const expiredToken = await new SignJWT({ email: "x@y.com", sub: "1" })
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt(now - 10)
			.setExpirationTime(now - 5)
			.sign(secret);
		await expect(verifyToken(expiredToken)).rejects.toThrow();
	});
});

// ---------------------------------------------------------------------------
// getAuthPlayer
// ---------------------------------------------------------------------------
describe("getAuthPlayer", () => {
	const mockPlayer = { email: "player@example.com", id: 7 };

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns null when no cookie header is set", async () => {
		const result = await getAuthPlayer(new Headers());
		expect(result).toBeNull();
	});

	it("returns null when cookie header is empty", async () => {
		const result = await getAuthPlayer(new Headers({ cookie: "" }));
		expect(result).toBeNull();
	});

	it("returns null when cookie has a different name", async () => {
		const result = await getAuthPlayer(
			new Headers({ cookie: "session=abc; other=xyz" }),
		);
		expect(result).toBeNull();
	});

	it("returns null when the token value is not a valid JWT", async () => {
		const headers = new Headers({ cookie: `${COOKIE_NAME}=garbage-value` });
		const result = await getAuthPlayer(headers);
		expect(result).toBeNull();
	});

	it("returns the player when token is valid and player exists in DB", async () => {
		const token = await signToken(mockPlayer.id, mockPlayer.email);
		dbMocks.limitFn.mockResolvedValueOnce([mockPlayer]);

		const headers = new Headers({ cookie: `${COOKIE_NAME}=${token}` });
		const result = await getAuthPlayer(headers);
		expect(result).toEqual(mockPlayer);
	});

	it("returns null when token is valid but player is not found in DB", async () => {
		const token = await signToken(99, "ghost@example.com");
		dbMocks.limitFn.mockResolvedValueOnce([]);

		const headers = new Headers({ cookie: `${COOKIE_NAME}=${token}` });
		const result = await getAuthPlayer(headers);
		expect(result).toBeNull();
	});

	it("parses the right cookie when multiple cookies are present", async () => {
		const token = await signToken(mockPlayer.id, mockPlayer.email);
		dbMocks.limitFn.mockResolvedValueOnce([mockPlayer]);

		const headers = new Headers({
			cookie: `session=xyz; ${COOKIE_NAME}=${token}; other=abc`,
		});
		const result = await getAuthPlayer(headers);
		expect(result).toEqual(mockPlayer);
	});

	it("returns null when DB query rejects", async () => {
		const token = await signToken(mockPlayer.id, mockPlayer.email);
		dbMocks.limitFn.mockRejectedValueOnce(new Error("DB unavailable"));

		const headers = new Headers({ cookie: `${COOKIE_NAME}=${token}` });
		const result = await getAuthPlayer(headers);
		expect(result).toBeNull();
	});
});
