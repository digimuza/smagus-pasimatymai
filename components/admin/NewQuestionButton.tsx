"use client";

import { useState } from "react";
import { QuestionFormDialog } from "./QuestionFormDialog";

type Category = { id: number; name: string };

export function NewQuestionButton({ categories }: { categories: Category[] }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-sm transition-colors hover:bg-indigo-500"
				onClick={() => setOpen(true)}
				type="button"
			>
				New question
			</button>
			<QuestionFormDialog
				categories={categories}
				onClose={() => setOpen(false)}
				open={open}
			/>
		</>
	);
}
