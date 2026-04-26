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
	onClose: () => void;
	/** Controlled open state. */
	open: boolean;
	/** When provided the dialog opens in edit mode. */
	question?: QuestionData;
}

const AUDIENCES = ["romantic", "family", "kids", "friends"] as const;
const LOCALES = ["lt", "en"] as const;

export function QuestionFormDialog({
	categories,
	question,
	open,
	onClose,
}: Props) {
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
			audience: fd.get("audience") as string,
			categoryId: Number(fd.get("categoryId")),
			locale: fd.get("locale") as string,
			question: (fd.get("question") as string).trim(),
			status: fd.get("status") as string,
		};

		try {
			const url = isEdit
				? `/api/admin/questions/${question?.id}`
				: "/api/admin/questions";
			const res = await fetch(url, {
				body: JSON.stringify(body),
				headers: { "Content-Type": "application/json" },
				method: isEdit ? "PATCH" : "POST",
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
			aria-modal="true"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
			role="dialog"
		>
			<div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
				<h2 className="mb-5 font-semibold text-base text-gray-100">
					{isEdit ? "Edit question" : "New question"}
				</h2>

				<form className="space-y-4" onSubmit={handleSubmit} ref={formRef}>
					<div>
						<label
							className="mb-1.5 block font-medium text-gray-400 text-xs uppercase tracking-wider"
							htmlFor="qfd-question"
						>
							Question text
						</label>
						<textarea
							className="w-full resize-none rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
							defaultValue={question?.question ?? ""}
							id="qfd-question"
							name="question"
							placeholder="Enter question text…"
							required
							rows={3}
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label
								className="mb-1.5 block font-medium text-gray-400 text-xs uppercase tracking-wider"
								htmlFor="qfd-category"
							>
								Category
							</label>
							<select
								className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
								defaultValue={question?.categoryId ?? ""}
								id="qfd-category"
								name="categoryId"
								required
							>
								<option disabled value="">
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
							<label
								className="mb-1.5 block font-medium text-gray-400 text-xs uppercase tracking-wider"
								htmlFor="qfd-audience"
							>
								Audience
							</label>
							<select
								className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
								defaultValue={question?.audience ?? "romantic"}
								id="qfd-audience"
								name="audience"
							>
								{AUDIENCES.map((a) => (
									<option key={a} value={a}>
										{a}
									</option>
								))}
							</select>
						</div>

						<div>
							<label
								className="mb-1.5 block font-medium text-gray-400 text-xs uppercase tracking-wider"
								htmlFor="qfd-status"
							>
								Status
							</label>
							<select
								className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
								defaultValue={question?.status ?? "published"}
								id="qfd-status"
								name="status"
							>
								<option value="published">Published</option>
								<option value="draft">Draft</option>
							</select>
						</div>

						<div>
							<label
								className="mb-1.5 block font-medium text-gray-400 text-xs uppercase tracking-wider"
								htmlFor="qfd-locale"
							>
								Locale
							</label>
							<select
								className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 text-sm focus:border-indigo-500 focus:outline-none"
								defaultValue={question?.locale ?? "lt"}
								id="qfd-locale"
								name="locale"
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
						<p className="rounded-md border border-red-700 bg-red-900/40 px-3 py-2 text-red-300 text-sm">
							{error}
						</p>
					)}

					<div className="flex justify-end gap-3 pt-1">
						<button
							className="rounded-md border border-gray-700 px-4 py-2 text-gray-400 text-sm transition-colors hover:text-white"
							onClick={onClose}
							type="button"
						>
							Cancel
						</button>
						<button
							className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-sm transition-colors hover:bg-indigo-500 disabled:opacity-50"
							disabled={saving}
							type="submit"
						>
							{saving ? "Saving…" : isEdit ? "Save changes" : "Create question"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
