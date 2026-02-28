export function getShareUrl(question: string, audience?: string): string {
	const base = typeof window !== "undefined" ? window.location.origin : "";
	const params = new URLSearchParams({ q: question });
	if (audience) params.set("a", audience);
	return `${base}/share?${params.toString()}`;
}

export async function shareQuestion(
	question: string,
	audience?: string,
): Promise<void> {
	const url = getShareUrl(question, audience);
	const text = `${question}\n\n— Santykių Klausimai`;

	if (navigator.share) {
		try {
			await navigator.share({ text, url });
			return;
		} catch {
			// User cancelled or not supported — fall through to clipboard
		}
	}

	try {
		await navigator.clipboard.writeText(`${text}\n${url}`);
	} catch {
		// Clipboard not available
	}
}
