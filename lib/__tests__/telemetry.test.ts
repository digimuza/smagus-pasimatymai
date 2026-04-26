import { afterEach, describe, expect, it, vi } from "vitest";

const mockSpan = {
	end: vi.fn(),
	recordException: vi.fn(),
	setStatus: vi.fn(),
};

vi.mock("@opentelemetry/api", () => ({
	SpanStatusCode: { ERROR: 2 },
	trace: {
		getActiveSpan: vi.fn(() => mockSpan),
		getTracer: vi.fn(() => ({
			startActiveSpan: vi.fn(
				(
					_name: string,
					_opts: unknown,
					fn: (span: typeof mockSpan) => unknown,
				) => fn(mockSpan),
			),
		})),
	},
}));

import { recordError, withSpan } from "../telemetry";

describe("withSpan", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns the result of the wrapped function", async () => {
		const result = await withSpan(
			"test-span",
			{ key: "value" },
			async () => 42,
		);
		expect(result).toBe(42);
	});

	it("ends the span after successful completion", async () => {
		await withSpan("test-span", {}, async () => "done");
		expect(mockSpan.end).toHaveBeenCalledOnce();
	});

	it("records exception, sets error status, and rethrows on failure", async () => {
		const error = new Error("boom");
		await expect(
			withSpan("test-span", {}, async () => {
				throw error;
			}),
		).rejects.toThrow("boom");
		expect(mockSpan.recordException).toHaveBeenCalledWith(error);
		expect(mockSpan.setStatus).toHaveBeenCalledWith(
			expect.objectContaining({ code: 2 }),
		);
		expect(mockSpan.end).toHaveBeenCalledOnce();
	});
});

describe("recordError", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("records the exception on the active span", () => {
		const error = new Error("record me");
		recordError(error);
		expect(mockSpan.recordException).toHaveBeenCalledWith(error);
		expect(mockSpan.setStatus).toHaveBeenCalled();
	});

	it("does nothing when there is no active span", async () => {
		const { trace } = await import("@opentelemetry/api");
		vi.mocked(trace.getActiveSpan).mockReturnValueOnce(undefined);
		expect(() => recordError(new Error("no span"))).not.toThrow();
	});
});
