"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
	questionId: number;
	/** When true, navigates to /admin/questions after deletion (use on detail page). */
	redirectAfter?: boolean;
}

export function DeleteQuestionButton({ questionId, redirectAfter }: Props) {
	const router = useRouter();
	const [confirming, setConfirming] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleDelete() {
		setDeleting(true);
		setError(null);
		try {
			const res = await fetch(`/api/admin/questions/${questionId}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.error ?? `Failed (${res.status})`);
				setConfirming(false);
				return;
			}
			if (redirectAfter) {
				router.push("/admin/questions");
			} else {
				router.refresh();
			}
		} catch {
			setError("Network error — please try again.");
			setConfirming(false);
		} finally {
			setDeleting(false);
		}
	}

	if (confirming) {
		return (
			<div className="flex items-center gap-2">
				<span className="text-sm text-gray-400">Delete this question?</span>
				<button
					onClick={handleDelete}
					disabled={deleting}
					className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
				>
					{deleting ? "Deleting…" : "Yes, delete"}
				</button>
				<button
					onClick={() => setConfirming(false)}
					className="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
				>
					Cancel
				</button>
				{error && <span className="text-sm text-red-400">{error}</span>}
			</div>
		);
	}

	return (
		<>
			<button
				onClick={() => setConfirming(true)}
				className="rounded-md border border-red-800 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
			>
				Delete
			</button>
			{error && <span className="ml-2 text-sm text-red-400">{error}</span>}
		</>
	);
}
