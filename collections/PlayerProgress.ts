import type { CollectionConfig } from "payload";

export const PlayerProgress: CollectionConfig = {
	access: {
		create: ({ req }) => !!req.user,
		delete: ({ req }) => {
			if (!req.user) return false;
			if (req.user.collection === "users") return true;
			return { player: { equals: req.user.id } };
		},
		read: ({ req }) => {
			if (!req.user) return false;
			if (req.user.collection === "users") return true;
			return { player: { equals: req.user.id } };
		},
		update: ({ req }) => {
			if (!req.user) return false;
			if (req.user.collection === "users") return true;
			return { player: { equals: req.user.id } };
		},
	},
	admin: {
		group: "Players",
	},
	fields: [
		{
			index: true,
			name: "player",
			relationTo: "players",
			required: true,
			type: "relationship",
		},
		{
			index: true,
			name: "questionId",
			required: true,
			type: "number",
		},
		{
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
		{
			name: "status",
			options: [
				{ label: "Answered", value: "answered" },
				{ label: "Skipped", value: "skipped" },
				{ label: "Superliked", value: "superliked" },
			],
			required: true,
			type: "select",
		},
		{
			defaultValue: () => new Date().toISOString(),
			name: "viewedAt",
			type: "date",
		},
	],
	slug: "player-progress",
};
