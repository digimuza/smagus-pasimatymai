"use client";

import { useState } from "react";
import { QuestionFormDialog } from "./QuestionFormDialog";

type Category = { id: number; name: string };

export function NewQuestionButton({ categories }: { categories: Category[] }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors"
			>
				New question
			</button>
			<QuestionFormDialog
				categories={categories}
				open={open}
				onClose={() => setOpen(false)}
			/>
		</>
	);
}
