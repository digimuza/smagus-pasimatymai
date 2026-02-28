import type { CollectionConfig } from "payload";

export const SpicyCardTypes: CollectionConfig = {
	access: {
		create: ({ req }) => !!req.user,
		delete: ({ req }) => !!req.user,
		read: () => true,
		update: ({ req }) => !!req.user,
	},
	admin: {
		useAsTitle: "label",
	},
	fields: [
		{
			name: "slug",
			required: true,
			type: "text",
			unique: true,
		},
		{
			name: "label",
			required: true,
			type: "text",
		},
		{
			name: "icon",
			required: true,
			type: "text",
		},
		{
			name: "color",
			required: true,
			type: "text",
		},
		{
			defaultValue: "lt",
			name: "locale",
			options: [
				{ label: "Lietuvių", value: "lt" },
				{ label: "English", value: "en" },
			],
			required: true,
			type: "select",
		},
	],
	slug: "spicy-card-types",
};
