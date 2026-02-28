import type { CollectionConfig } from "payload";

export const QuestionSubmissions: CollectionConfig = {
	access: {
		create: ({ req }) => !!req.user,
		delete: ({ req }) => req.user?.collection === "users",
		read: ({ req }) => {
			if (!req.user) return false;
			if (req.user.collection === "users") return true;
			return { submittedBy: { equals: req.user.id } };
		},
		update: ({ req }) => req.user?.collection === "users",
	},
	admin: {
		description: "User-submitted questions pending moderation",
		group: "Content",
		useAsTitle: "text",
	},
	fields: [
		{
			maxLength: 300,
			name: "text",
			required: true,
			type: "textarea",
		},
		{
			defaultValue: "romantic",
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
		{
			admin: { readOnly: true },
			name: "submittedBy",
			relationTo: "players",
			type: "relationship",
		},
		{
			defaultValue: "pending",
			name: "status",
			options: [
				{ label: "Pending", value: "pending" },
				{ label: "Approved", value: "approved" },
				{ label: "Rejected", value: "rejected" },
			],
			type: "select",
		},
		{
			admin: {
				description: "Internal note about why this was approved/rejected",
			},
			name: "moderatorNote",
			type: "textarea",
		},
	],
	slug: "question-submissions",
};
