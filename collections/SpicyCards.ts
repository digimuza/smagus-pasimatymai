import type { CollectionConfig } from "payload";

export const SpicyCards: CollectionConfig = {
	access: {
		create: ({ req }) => !!req.user,
		delete: ({ req }) => !!req.user,
		read: () => true,
		update: ({ req }) => !!req.user,
	},
	admin: {
		useAsTitle: "title",
	},
	fields: [
		{
			name: "title",
			required: true,
			type: "text",
		},
		{
			name: "description",
			required: true,
			type: "text",
		},
		{
			name: "cardType",
			relationTo: "spicy-card-types",
			required: true,
			type: "relationship",
		},
		{
			defaultValue: "lt",
			index: true,
			name: "locale",
			options: [
				{ label: "Lietuvių", value: "lt" },
				{ label: "English", value: "en" },
			],
			required: true,
			type: "select",
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
		{
			defaultValue: "published",
			index: true,
			name: "status",
			options: [
				{ label: "Draft", value: "draft" },
				{ label: "Published", value: "published" },
			],
			required: true,
			type: "select",
		},
	],
	slug: "spicy-cards",
};
