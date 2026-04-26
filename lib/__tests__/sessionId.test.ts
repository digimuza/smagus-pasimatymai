import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SESSION_KEY = "santykiu_session_id";

describe("getSessionId", () => {
	beforeEach(() => {
		sessionStorage.clear();
		vi.stubGlobal("crypto", {
			randomUUID: vi.fn(() => "generated-uuid-1234"),
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		sessionStorage.clear();
	});

	it("returns empty string when window is undefined (SSR)", async () => {
		vi.stubGlobal("window", undefined);
		// Re-import to get the function evaluated after stubbing
		const { getSessionId } = await import("../sessionId");
		expect(getSessionId()).toBe("");
	});

	it("generates a UUID and stores it when session is empty", async () => {
		const { getSessionId } = await import("../sessionId");
		const id = getSessionId();
		expect(id).toBe("generated-uuid-1234");
		expect(sessionStorage.getItem(SESSION_KEY)).toBe("generated-uuid-1234");
	});

	it("returns the existing session ID from sessionStorage", async () => {
		sessionStorage.setItem(SESSION_KEY, "existing-id-abc");
		const { getSessionId } = await import("../sessionId");
		const id = getSessionId();
		expect(id).toBe("existing-id-abc");
	});

	it("does not call randomUUID when an ID already exists", async () => {
		sessionStorage.setItem(SESSION_KEY, "pre-existing-id");
		const { getSessionId } = await import("../sessionId");
		getSessionId();
		expect(crypto.randomUUID).not.toHaveBeenCalled();
	});

	it("returns the same ID on subsequent calls", async () => {
		const { getSessionId } = await import("../sessionId");
		const first = getSessionId();
		const second = getSessionId();
		expect(first).toBe(second);
	});
});
