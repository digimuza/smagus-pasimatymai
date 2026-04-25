"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Category = { id: number; name: string };

type QuestionData = {
	id: number;
	question: string;
	categoryId: number;
	audience: "romantic" | "family" | "kids" | "friends";
	status: "draft" | "published";
	locale: "lt" | "en";
};

interface Props {
	categories: Category[];
	/** When provided the dialog opens in edit mode. */
	question?: QuestionData;
	/** Controlled open state. */
	open: boolean;
	onClose: () => void;
}

const AUDIENCES = ["romantic", "family", "kids", "friends"] as const;
const LOCALES = ["lt", "en"] as const;

export function QuestionFormDialog({ categories, question, open, onClose }: Props) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	if (!open) return null;

	const isEdit = !!question;

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setSaving(true);

		const fd = new FormData(e.currentTarget);
		const body = {
			question: (fd.get("question") as string).trim(),
			categoryId: Number(fd.get("categoryId")),
			audience: fd.get("audience") as string,
			status: fd.get("status") as string,
			locale: fd.get("locale") as string,
		};

		try {
			const url = isEdit
				? `/api/admin/questions/${question!.id}`
				: "/api/admin/questions";
			const res = await fetch(url, {
				method: isEdit ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.error ?? `Request failed (${res.status})`);
				return;
			}

			router.refresh();
			onClose();
		} catch {
			setError("Network error — please try again.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
			onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
		>
			<div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
				<h2 className="mb-5 text-base font-semibold text-gray-100">
					{isEdit ? "Edit question" : "New question"}
				</h2>

				<form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">
							Question text
						</label>
						<textarea
							name="question"
							required
							defaultValue={question?.question ?? ""}
							rows={3}
							className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none resize-none"
							placeholder="Enter question text…"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">
								Category
							</label>
							<select
								name="categoryId"
								required
								defaultValue={question?.categoryId ?? ""}
								className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
							>
								<option value="" disabled>
									Select…
								</option>
								{categories.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">
								Audience
							</label>
							<select
								name="audience"
								defaultValue={question?.audience ?? "romantic"}
								className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
							>
								{AUDIENCES.map((a) => (
									<option key={a} value={a}>
										{a}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">
								Status
							</label>
							<select
								name="status"
								defaultValue={question?.status ?? "published"}
								className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
							>
								<option value="published">Published</option>
								<option value="draft">Draft</option>
							</select>
						</div>

						<div>
							<label className="mb-1.5 block text-xs font-medium text-gray-400 uppercase tracking-wider">
								Locale
							</label>
							<select
								name="locale"
								defaultValue={question?.locale ?? "lt"}
								className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
							>
								{LOCALES.map((l) => (
									<option key={l} value={l}>
										{l}
									</option>
								))}
							</select>
						</div>
					</div>

					{error && (
						<p className="rounded-md bg-red-900/40 border border-red-700 px-3 py-2 text-sm text-red-300">
							{error}
						</p>
					)}

					<div className="flex justify-end gap-3 pt-1">
						<button
							type="button"
							onClick={onClose}
							className="rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={saving}
							className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
						>
							{saving ? "Saving…" : isEdit ? "Save changes" : "Create question"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
