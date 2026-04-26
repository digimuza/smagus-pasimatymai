import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockedFunction,
	vi,
} from "vitest";
import { hasAnalyticsConsent } from "../cookieConsent";
import { getSessionId } from "../sessionId";

vi.mock("../cookieConsent", () => ({
	hasAnalyticsConsent: vi.fn(() => true),
}));

vi.mock("../sessionId", () => ({
	getSessionId: vi.fn(() => "test-session-id"),
}));

const mockHasConsent = hasAnalyticsConsent as MockedFunction<
	typeof hasAnalyticsConsent
>;
const mockGetSessionId = getSessionId as MockedFunction<typeof getSessionId>;

// Imported after mocks are set up so the singleton picks up mocked dependencies.
const { analytics } = await import("../analytics");

function parseFetchPayload(mockFetch: MockedFunction<typeof fetch>) {
	const body = (mockFetch.mock.calls[0][1] as RequestInit).body as string;
	return JSON.parse(body) as {
		events: Array<{
			eventType: string;
			questionId: number | string;
			sessionId: string;
			timeSpent?: number;
			timestamp: string;
		}>;
		session?: {
			audience?: string;
			device?: string;
			endedAt?: string;
			locale?: string;
			questionsSkipped: number;
			questionsViewed: number;
			sessionId: string;
			spicyCardsViewed: number;
			startedAt: string;
		};
	};
}

describe("AnalyticsBuffer", () => {
	let mockFetch: MockedFunction<typeof fetch>;
	let mockSendBeacon: MockedFunction<typeof navigator.sendBeacon>;

	beforeEach(() => {
		vi.useFakeTimers();

		mockFetch = vi.fn(() =>
			Promise.resolve(new Response("{}", { status: 200 })),
		);
		mockSendBeacon = vi.fn(() => true);

		vi.stubGlobal("fetch", mockFetch);
		vi.stubGlobal("navigator", {
			sendBeacon: mockSendBeacon,
			userAgent: "test-agent/1.0",
		});
		vi.stubGlobal("document", {
			addEventListener: vi.fn(),
			visibilityState: "visible",
		});
		vi.stubGlobal("window", { addEventListener: vi.fn() });

		mockHasConsent.mockReturnValue(true);
		mockGetSessionId.mockReturnValue("test-session-id");
	});

	afterEach(() => {
		analytics.destroy();
		vi.unstubAllGlobals();
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	describe("init()", () => {
		it("initializes session with correct metadata", () => {
			analytics.init({ audience: "romantic", locale: "en" });
			analytics.track("viewed", 1);
			analytics.flush();

			const payload = parseFetchPayload(mockFetch);
			expect(payload.session).toMatchObject({
				audience: "romantic",
				device: "test-agent/1.0",
				locale: "en",
				questionsSkipped: 0,
				questionsViewed: 1,
				sessionId: "test-session-id",
				spicyCardsViewed: 0,
			});
			expect(payload.session?.startedAt).toBeDefined();
		});

		it("does not create a session when consent is denied", () => {
			mockHasConsent.mockReturnValue(false);
			analytics.init({ audience: "romantic" });
			analytics.track("viewed", 1);
			analytics.flush();

			// Events may still be sent (track() queues regardless of consent),
			// but no session should be attached because init() was blocked.
			if (mockFetch.mock.calls.length > 0) {
				expect(parseFetchPayload(mockFetch).session).toBeUndefined();
			}
		});

		it("is idempotent — second call is a no-op", () => {
			analytics.init({ audience: "romantic" });
			analytics.init({ audience: "family" });

			// Only one interval should be running
			expect(vi.getTimerCount()).toBe(1);
		});

		it("does not initialize when sessionId is empty", () => {
			mockGetSessionId.mockReturnValue("");
			analytics.init({});
			analytics.track("viewed", 1);
			analytics.flush();

			expect(mockFetch).not.toHaveBeenCalled();
		});
	});

	describe("track()", () => {
		beforeEach(() => {
			analytics.init({ audience: "romantic", locale: "en" });
		});

		it("adds an event to the queue with correct fields", () => {
			analytics.track("answered", 42, 30);
			analytics.flush();

			const payload = parseFetchPayload(mockFetch);
			expect(payload.events).toHaveLength(1);
			expect(payload.events[0]).toMatchObject({
				eventType: "answered",
				questionId: 42,
				sessionId: "test-session-id",
				timeSpent: 30,
			});
			expect(payload.events[0].timestamp).toBeDefined();
		});

		it("includes timeSpent when provided", () => {
			analytics.track("skipped", 1, 45);
			analytics.flush();

			expect(parseFetchPayload(mockFetch).events[0].timeSpent).toBe(45);
		});

		it("omits timeSpent when not provided", () => {
			analytics.track("viewed", 1);
			analytics.flush();

			expect(parseFetchPayload(mockFetch).events[0].timeSpent).toBeUndefined();
		});

		it("increments questionsViewed on 'viewed'", () => {
			analytics.track("viewed", 1);
			analytics.track("viewed", 2);
			analytics.flush();

			const { session } = parseFetchPayload(mockFetch);
			expect(session?.questionsViewed).toBe(2);
			expect(session?.questionsSkipped).toBe(0);
		});

		it("increments questionsSkipped on 'skipped'", () => {
			analytics.track("skipped", 1, 5);
			analytics.track("skipped", 2, 8);
			analytics.flush();

			const { session } = parseFetchPayload(mockFetch);
			expect(session?.questionsSkipped).toBe(2);
			expect(session?.questionsViewed).toBe(0);
		});

		it("increments spicyCardsViewed on 'spicy_dismissed'", () => {
			analytics.track("spicy_dismissed", 5);
			analytics.flush();

			expect(parseFetchPayload(mockFetch).session?.spicyCardsViewed).toBe(1);
		});

		it("does not change counters for 'answered'", () => {
			analytics.track("answered", 1, 15);
			analytics.flush();

			const { session } = parseFetchPayload(mockFetch);
			expect(session?.questionsViewed).toBe(0);
			expect(session?.questionsSkipped).toBe(0);
			expect(session?.spicyCardsViewed).toBe(0);
		});

		it("does not change counters for 'superliked'", () => {
			analytics.track("superliked", 1, 10);
			analytics.flush();

			const { session } = parseFetchPayload(mockFetch);
			expect(session?.questionsViewed).toBe(0);
			expect(session?.questionsSkipped).toBe(0);
		});

		it("accumulates multiple events before flush", () => {
			analytics.track("viewed", 1);
			analytics.track("skipped", 1, 5);
			analytics.track("answered", 2, 10);
			analytics.track("superliked", 3, 8);
			analytics.flush();

			expect(parseFetchPayload(mockFetch).events).toHaveLength(4);
		});

		it("skips tracking when getSessionId returns empty string", () => {
			mockGetSessionId.mockReturnValue("");
			analytics.track("viewed", 1);
			analytics.flush();

			// Only the session payload is sent (flush still runs for the session), but
			// no events should be in the queue.
			const calls = mockFetch.mock.calls;
			if (calls.length > 0) {
				const payload = parseFetchPayload(mockFetch);
				expect(payload.events).toHaveLength(0);
			} else {
				expect(mockFetch).not.toHaveBeenCalled();
			}
		});
	});

	describe("flush()", () => {
		it("does nothing when queue is empty and session is null", () => {
			// No init called → session is null and queue is empty
			analytics.flush();

			expect(mockFetch).not.toHaveBeenCalled();
			expect(mockSendBeacon).not.toHaveBeenCalled();
		});

		it("sends via fetch when useSendBeacon is false", () => {
			analytics.init({});
			analytics.track("viewed", 1);
			analytics.flush();

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/analytics",
				expect.objectContaining({
					headers: { "Content-Type": "application/json" },
					method: "POST",
				}),
			);
			expect(mockSendBeacon).not.toHaveBeenCalled();
		});

		it("sends via sendBeacon when useSendBeacon is true", () => {
			analytics.init({});
			analytics.track("viewed", 1);
			analytics.flush(true);

			expect(mockSendBeacon).toHaveBeenCalledWith(
				"/api/analytics",
				expect.any(Blob),
			);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("does not re-send events that were already flushed", () => {
			analytics.init({});
			analytics.track("viewed", 1);
			analytics.flush(); // sends 1 event

			analytics.flush(); // second flush — queue is now empty

			// Second call still runs (session is non-null), but events array is empty.
			expect(mockFetch).toHaveBeenCalledTimes(2);
			const secondBody = JSON.parse(
				(mockFetch.mock.calls[1][1] as RequestInit).body as string,
			) as { events: unknown[] };
			expect(secondBody.events).toHaveLength(0);
		});

		it("includes endedAt timestamp in flushed session", () => {
			analytics.init({});
			analytics.track("viewed", 1);
			analytics.flush();

			const { session } = parseFetchPayload(mockFetch);
			expect(session?.endedAt).toBeDefined();
		});

		it("auto-flushes every 10 seconds via the interval", () => {
			analytics.init({});
			analytics.track("viewed", 1);

			vi.advanceTimersByTime(10_000);

			expect(mockFetch).toHaveBeenCalledTimes(1);
		});
	});

	describe("destroy()", () => {
		it("clears the periodic flush interval", () => {
			analytics.init({});
			expect(vi.getTimerCount()).toBe(1);

			analytics.destroy();
			expect(vi.getTimerCount()).toBe(0);
		});

		it("allows re-initialization after destroy", () => {
			analytics.init({ audience: "romantic" });
			analytics.destroy();
			mockFetch.mockClear();
			mockSendBeacon.mockClear();

			analytics.init({ audience: "family" });
			analytics.track("viewed", 1);
			analytics.flush();

			const { session } = parseFetchPayload(mockFetch);
			expect(session?.audience).toBe("family");
		});
	});
});
