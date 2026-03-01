const STORAGE_KEY = "cookie_consent";

export type ConsentStatus = "accepted" | "rejected" | null;

export function getConsentStatus(): ConsentStatus {
	if (typeof window === "undefined") return null;
	const value = localStorage.getItem(STORAGE_KEY);
	if (value === "accepted" || value === "rejected") return value;
	return null;
}

export function setConsentStatus(status: "accepted" | "rejected"): void {
	localStorage.setItem(STORAGE_KEY, status);
}

export function hasAnalyticsConsent(): boolean {
	return getConsentStatus() === "accepted";
}
