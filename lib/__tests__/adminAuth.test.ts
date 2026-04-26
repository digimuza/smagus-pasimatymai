import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
	getAuthPlayer: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
	getAuthPlayer: authMocks.getAuthPlayer,
}));

import { requireAdminApi } from "../adminAuth";

describe("requireAdminApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.env.ADMIN_EMAILS = "admin@example.com,superuser@example.com";
	});

	afterEach(() => {
		delete process.env.ADMIN_EMAILS;
	});

	it("returns 401 when no player is authenticated", async () => {
		authMocks.getAuthPlayer.mockResolvedValue(null);
		const result = await requireAdminApi(new Headers());
		expect(result).not.toBeNull();
		expect(result?.status).toBe(401);
		const data = await result?.json();
		expect(data.error).toBe("Unauthorized");
	});

	it("returns 403 when player is not in ADMIN_EMAILS", async () => {
		authMocks.getAuthPlayer.mockResolvedValue({
			email: "user@example.com",
			id: 1,
		});
		const result = await requireAdminApi(new Headers());
		expect(result).not.toBeNull();
		expect(result?.status).toBe(403);
		const data = await result?.json();
		expect(data.error).toBe("Forbidden");
	});

	it("returns null when player is an admin", async () => {
		authMocks.getAuthPlayer.mockResolvedValue({
			email: "admin@example.com",
			id: 1,
		});
		const result = await requireAdminApi(new Headers());
		expect(result).toBeNull();
	});

	it("matches admin email case-insensitively", async () => {
		authMocks.getAuthPlayer.mockResolvedValue({
			email: "ADMIN@EXAMPLE.COM",
			id: 1,
		});
		const result = await requireAdminApi(new Headers());
		expect(result).toBeNull();
	});

	it("allows the second admin email in the list", async () => {
		authMocks.getAuthPlayer.mockResolvedValue({
			email: "superuser@example.com",
			id: 2,
		});
		const result = await requireAdminApi(new Headers());
		expect(result).toBeNull();
	});

	it("returns 403 when ADMIN_EMAILS is empty", async () => {
		process.env.ADMIN_EMAILS = "";
		authMocks.getAuthPlayer.mockResolvedValue({
			email: "admin@example.com",
			id: 1,
		});
		const result = await requireAdminApi(new Headers());
		expect(result).not.toBeNull();
		expect(result?.status).toBe(403);
	});

	it("returns 403 when ADMIN_EMAILS is unset", async () => {
		delete process.env.ADMIN_EMAILS;
		authMocks.getAuthPlayer.mockResolvedValue({
			email: "admin@example.com",
			id: 1,
		});
		const result = await requireAdminApi(new Headers());
		expect(result).not.toBeNull();
		expect(result?.status).toBe(403);
	});
});
