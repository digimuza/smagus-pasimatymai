import type { CollectionConfig } from "payload";

export const GameSessions: CollectionConfig = {
	access: {
		create: () => true,
		delete: ({ req }) => !!req.user,
		read: ({ req }) => !!req.user,
		update: ({ req }) => !!req.user,
	},
	admin: {
		useAsTitle: "sessionId",
	},
	fields: [
		{
			index: true,
			name: "sessionId",
			required: true,
			type: "text",
			unique: true,
		},
		{
			name: "startedAt",
			required: true,
			type: "date",
		},
		{
			name: "endedAt",
			type: "date",
		},
		{
			name: "audience",
			options: [
				{ label: "Romantic", value: "romantic" },
				{ label: "Family", value: "family" },
				{ label: "Kids", value: "kids" },
				{ label: "Friends", value: "friends" },
			],
			type: "select",
		},
		{
			name: "locale",
			options: [
				{ label: "Lietuviu", value: "lt" },
				{ label: "English", value: "en" },
			],
			type: "select",
		},
		{
			defaultValue: 0,
			name: "questionsViewed",
			type: "number",
		},
		{
			defaultValue: 0,
			name: "questionsSkipped",
			type: "number",
		},
		{
			defaultValue: 0,
			name: "spicyCardsViewed",
			type: "number",
		},
		{
			name: "duration",
			type: "number",
		},
		{
			name: "device",
			type: "text",
		},
	],
	slug: "game-sessions",
};
