import type { CollectionConfig } from "payload";

export const DailyQuestions: CollectionConfig = {
	access: {
		create: ({ req }) => req.user?.collection === "users",
		delete: ({ req }) => req.user?.collection === "users",
		read: () => true,
		update: ({ req }) => req.user?.collection === "users",
	},
	admin: {
		description: "Daily featured question for each audience",
		group: "Content",
		useAsTitle: "date",
	},
	fields: [
		{
			admin: { description: "YYYY-MM-DD format" },
			name: "date",
			required: true,
			type: "text",
			unique: true,
		},
		{
			name: "question",
			relationTo: "questions",
			required: true,
			type: "relationship",
		},
		{
			defaultValue: "romantic",
			index: true,
			name: "audience",
			options: [
				{ label: "Romantic", value: "romantic" },
				{ label: "Family", value: "family" },
				{ label: "Kids", value: "kids" },
				{ label: "Friends", value: "friends" },
			],
			required: true,
			type: "select",
		},
	],
	slug: "daily-questions",
};
