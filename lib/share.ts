export async function shareSession(opts: {
	text: string;
	title: string;
	url: string;
}): Promise<"shared" | "copied" | "failed"> {
	if (typeof navigator !== "undefined" && navigator.share) {
		try {
			await navigator.share({
				text: opts.text,
				title: opts.title,
				url: opts.url,
			});
			return "shared";
		} catch {
			// User cancelled — fall through to clipboard
		}
	}
	try {
		await navigator.clipboard.writeText(`${opts.text}\n${opts.url}`);
		return "copied";
	} catch {
		return "failed";
	}
}

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
