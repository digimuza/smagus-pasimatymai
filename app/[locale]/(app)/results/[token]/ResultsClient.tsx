"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";

interface ResultQuestion {
	id: number;
	playerAAction: string;
	playerBAction: string;
	text: string;
}

interface ResultsData {
	agreed: ResultQuestion[];
	bothSkipped: ResultQuestion[];
	disagreed: ResultQuestion[];
}

interface ResultsClientProps {
	token: string;
}

export function ResultsClient({ token }: ResultsClientProps) {
	const t = useTranslations("pairingResults");
	const tCommon = useTranslations("common");
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const [results, setResults] = useState<ResultsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (authLoading) return;

		if (!isAuthenticated) {
			router.push("/audience");
			return;
		}

		fetch(`/api/sessions/${token}/results`, { credentials: "include" })
			.then(async (res) => {
				if (!res.ok) {
					setError(true);
					setIsLoading(false);
					return;
				}
				const data: ResultsData = await res.json();
				setResults(data);
				setIsLoading(false);
			})
			.catch(() => {
				setError(true);
				setIsLoading(false);
			});
	}, [token, isAuthenticated, authLoading, router]);

	if (isLoading || authLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-primary text-xl">{tCommon("loading")}</div>
			</div>
		);
	}

	if (error || !results) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<p className="text-center text-text-muted">{tCommon("loading")}</p>
			</div>
		);
	}

	const shareResults = async () => {
		const url = window.location.href;
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({ url });
				return;
			} catch {
				// Fall through to clipboard
			}
		}
		if (typeof navigator !== "undefined" && navigator.clipboard) {
			await navigator.clipboard.writeText(url);
		}
	};

	return (
		<div className="mx-auto max-w-lg space-y-8 p-6">
			<h1 className="text-center font-bold text-2xl text-text">{t("title")}</h1>

			{results.agreed.length > 0 && (
				<section>
					<h2 className="mb-3 font-semibold text-lg text-primary">
						{t("agreed")} ({results.agreed.length})
					</h2>
					<div className="space-y-2">
						{results.agreed.map((q) => (
							<div className="rounded-xl bg-primary/10 p-3" key={q.id}>
								<p className="text-sm text-text">{q.text}</p>
							</div>
						))}
					</div>
				</section>
			)}

			{results.disagreed.length > 0 && (
				<section>
					<h2 className="mb-3 font-semibold text-accent text-lg">
						{t("disagreed")} ({results.disagreed.length})
					</h2>
					<div className="space-y-2">
						{results.disagreed.map((q) => (
							<div className="rounded-xl bg-accent/10 p-3" key={q.id}>
								<p className="text-sm text-text">{q.text}</p>
								<div className="mt-2 flex gap-4 text-text-muted text-xs">
									<span>You: {q.playerAAction}</span>
									<span>Partner: {q.playerBAction}</span>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			{results.bothSkipped.length > 0 && (
				<section>
					<h2 className="mb-3 font-semibold text-lg text-text-muted">
						{t("bothSkipped")} ({results.bothSkipped.length})
					</h2>
					<div className="space-y-2">
						{results.bothSkipped.map((q) => (
							<div className="rounded-xl bg-background-light p-3" key={q.id}>
								<p className="text-sm text-text-muted">{q.text}</p>
							</div>
						))}
					</div>
				</section>
			)}

			<div className="flex flex-col gap-3 pt-4">
				<Button
					fullWidth
					onClick={shareResults}
					type="button"
					variant="secondary"
				>
					{t("share")}
				</Button>
				<Button
					fullWidth
					onClick={() => router.push("/game")}
					type="button"
					variant="primary"
				>
					{t("playMore")}
				</Button>
			</div>
		</div>
	);
}
