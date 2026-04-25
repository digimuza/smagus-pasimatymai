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
	question: QuestionData;
	categories: Category[];
}

export function EditQuestionButton({ question, categories }: Props) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
			>
				Edit
			</button>
			<QuestionFormDialog
				categories={categories}
				question={question}
				open={open}
				onClose={() => setOpen(false)}
			/>
		</>
	);
}
