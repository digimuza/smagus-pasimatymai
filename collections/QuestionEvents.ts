import type { CollectionConfig } from "payload";

export const QuestionEvents: CollectionConfig = {
	access: {
		create: () => true,
		delete: ({ req }) => !!req.user,
		read: ({ req }) => !!req.user,
		update: ({ req }) => !!req.user,
	},
	admin: {
		useAsTitle: "eventType",
	},
	fields: [
		{
			index: true,
			name: "sessionId",
			required: true,
			type: "text",
		},
		{
			index: true,
			name: "questionId",
			required: true,
			type: "number",
		},
		{
			index: true,
			name: "eventType",
			options: [
				{ label: "Viewed", value: "viewed" },
				{ label: "Skipped", value: "skipped" },
				{ label: "Answered", value: "answered" },
				{ label: "Superliked", value: "superliked" },
				{ label: "Spicy Dismissed", value: "spicy_dismissed" },
			],
			required: true,
			type: "select",
		},
		{
			index: true,
			name: "timestamp",
			required: true,
			type: "date",
		},
		{
			name: "timeSpent",
			type: "number",
		},
	],
	slug: "question-events",
};
