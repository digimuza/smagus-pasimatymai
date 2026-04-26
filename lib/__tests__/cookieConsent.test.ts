import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	getConsentStatus,
	hasAnalyticsConsent,
	setConsentStatus,
} from "../cookieConsent";

const STORAGE_KEY = "cookie_consent";

describe("cookieConsent", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		localStorage.clear();
	});

	describe("getConsentStatus", () => {
		it("returns null when window is undefined (SSR)", () => {
			vi.stubGlobal("window", undefined);
			expect(getConsentStatus()).toBeNull();
		});

		it("returns null when nothing is stored", () => {
			expect(getConsentStatus()).toBeNull();
		});

		it("returns null when stored value is not a valid consent status", () => {
			localStorage.setItem(STORAGE_KEY, "unknown");
			expect(getConsentStatus()).toBeNull();
		});

		it("returns 'accepted' when stored value is 'accepted'", () => {
			localStorage.setItem(STORAGE_KEY, "accepted");
			expect(getConsentStatus()).toBe("accepted");
		});

		it("returns 'rejected' when stored value is 'rejected'", () => {
			localStorage.setItem(STORAGE_KEY, "rejected");
			expect(getConsentStatus()).toBe("rejected");
		});
	});

	describe("setConsentStatus", () => {
		it("writes 'accepted' to localStorage", () => {
			setConsentStatus("accepted");
			expect(localStorage.getItem(STORAGE_KEY)).toBe("accepted");
		});

		it("writes 'rejected' to localStorage", () => {
			setConsentStatus("rejected");
			expect(localStorage.getItem(STORAGE_KEY)).toBe("rejected");
		});

		it("overwrites a previous value", () => {
			setConsentStatus("accepted");
			setConsentStatus("rejected");
			expect(localStorage.getItem(STORAGE_KEY)).toBe("rejected");
		});
	});

	describe("hasAnalyticsConsent", () => {
		it("returns true when consent is 'accepted'", () => {
			localStorage.setItem(STORAGE_KEY, "accepted");
			expect(hasAnalyticsConsent()).toBe(true);
		});

		it("returns false when consent is 'rejected'", () => {
			localStorage.setItem(STORAGE_KEY, "rejected");
			expect(hasAnalyticsConsent()).toBe(false);
		});

		it("returns false when consent is null (nothing stored)", () => {
			expect(hasAnalyticsConsent()).toBe(false);
		});

		it("returns false when window is undefined (SSR)", () => {
			vi.stubGlobal("window", undefined);
			expect(hasAnalyticsConsent()).toBe(false);
		});
	});
});
