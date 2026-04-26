"use client";

import { useState } from "react";
import { QuestionFormDialog } from "./QuestionFormDialog";

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
	question: QuestionData;
}

export function EditQuestionButton({ question, categories }: Props) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				className="rounded-md border border-gray-700 px-3 py-1.5 text-gray-300 text-sm transition-colors hover:border-gray-500 hover:text-white"
				onClick={() => setOpen(true)}
				type="button"
			>
				Edit
			</button>
			<QuestionFormDialog
				categories={categories}
				onClose={() => setOpen(false)}
				open={open}
				question={question}
			/>
		</>
	);
}
