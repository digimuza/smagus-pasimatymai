import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getShareUrl, shareQuestion, shareSession } from "../share";

describe("getShareUrl", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("builds a URL with the question parameter", () => {
		vi.stubGlobal("window", { location: { origin: "https://example.com" } });
		const url = getShareUrl("What is love?");
		expect(url).toBe("https://example.com/share?q=What+is+love%3F");
	});

	it("includes the audience parameter when provided", () => {
		vi.stubGlobal("window", { location: { origin: "https://example.com" } });
		const url = getShareUrl("Best trip?", "friends");
		expect(url).toContain("a=friends");
		expect(url).toContain("q=Best+trip");
	});

	it("omits the audience parameter when not provided", () => {
		vi.stubGlobal("window", { location: { origin: "https://example.com" } });
		const url = getShareUrl("Favourite memory?");
		expect(url).not.toContain("a=");
	});

	it("uses an empty base when window is undefined (SSR)", () => {
		vi.stubGlobal("window", undefined);
		const url = getShareUrl("hello");
		expect(url).toMatch(/^\/share\?/);
	});
});

describe("shareSession", () => {
	let shareMock: ReturnType<typeof vi.fn>;
	let writeTextMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		shareMock = vi.fn();
		writeTextMock = vi.fn();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	const opts = {
		text: "Check this out",
		title: "Session",
		url: "https://example.com/session",
	};

	it("returns 'shared' when navigator.share succeeds", async () => {
		shareMock.mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: { writeText: writeTextMock },
			share: shareMock,
		});

		const result = await shareSession(opts);
		expect(result).toBe("shared");
		expect(shareMock).toHaveBeenCalledWith({
			text: opts.text,
			title: opts.title,
			url: opts.url,
		});
	});

	it("falls through to clipboard when navigator.share throws", async () => {
		shareMock.mockRejectedValue(new Error("AbortError"));
		writeTextMock.mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: { writeText: writeTextMock },
			share: shareMock,
		});

		const result = await shareSession(opts);
		expect(result).toBe("copied");
		expect(writeTextMock).toHaveBeenCalledWith(`${opts.text}\n${opts.url}`);
	});

	it("returns 'copied' when navigator.share is unavailable but clipboard succeeds", async () => {
		writeTextMock.mockResolvedValue(undefined);
		vi.stubGlobal("navigator", { clipboard: { writeText: writeTextMock } });

		const result = await shareSession(opts);
		expect(result).toBe("copied");
	});

	it("returns 'failed' when both share and clipboard fail", async () => {
		shareMock.mockRejectedValue(new Error("AbortError"));
		writeTextMock.mockRejectedValue(new Error("NotAllowedError"));
		vi.stubGlobal("navigator", {
			clipboard: { writeText: writeTextMock },
			share: shareMock,
		});

		const result = await shareSession(opts);
		expect(result).toBe("failed");
	});

	it("returns 'failed' when navigator.share is absent and clipboard throws", async () => {
		writeTextMock.mockRejectedValue(new Error("NotAllowedError"));
		vi.stubGlobal("navigator", { clipboard: { writeText: writeTextMock } });

		const result = await shareSession(opts);
		expect(result).toBe("failed");
	});
});

describe("shareQuestion", () => {
	let shareMock: ReturnType<typeof vi.fn>;
	let writeTextMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		shareMock = vi.fn();
		writeTextMock = vi.fn();
		vi.stubGlobal("window", { location: { origin: "https://example.com" } });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("calls navigator.share when available", async () => {
		shareMock.mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: { writeText: writeTextMock },
			share: shareMock,
		});

		await shareQuestion("What is love?");

		expect(shareMock).toHaveBeenCalledOnce();
		const call = shareMock.mock.calls[0][0] as { text: string; url: string };
		expect(call.text).toContain("What is love?");
		expect(call.url).toContain("/share?");
	});

	it("falls back to clipboard when navigator.share throws", async () => {
		shareMock.mockRejectedValue(new Error("AbortError"));
		writeTextMock.mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: { writeText: writeTextMock },
			share: shareMock,
		});

		await shareQuestion("Best memory?");

		expect(writeTextMock).toHaveBeenCalledOnce();
	});

	it("uses clipboard when navigator.share is not available", async () => {
		writeTextMock.mockResolvedValue(undefined);
		vi.stubGlobal("navigator", { clipboard: { writeText: writeTextMock } });

		await shareQuestion("Favourite trip?");

		expect(writeTextMock).toHaveBeenCalledOnce();
	});

	it("includes audience in the URL when provided", async () => {
		shareMock.mockResolvedValue(undefined);
		vi.stubGlobal("navigator", {
			clipboard: { writeText: writeTextMock },
			share: shareMock,
		});

		await shareQuestion("Best trip?", "romantic");

		const call = shareMock.mock.calls[0][0] as { url: string };
		expect(call.url).toContain("a=romantic");
	});

	it("silently swallows clipboard errors", async () => {
		writeTextMock.mockRejectedValue(new Error("NotAllowedError"));
		vi.stubGlobal("navigator", { clipboard: { writeText: writeTextMock } });

		await expect(shareQuestion("Test question")).resolves.toBeUndefined();
	});
});
