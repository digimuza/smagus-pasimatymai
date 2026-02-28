import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
	access: {
		create: ({ req }) => !!req.user,
		delete: ({ req }) => !!req.user,
		read: () => true,
		update: ({ req }) => !!req.user,
	},
	admin: {
		useAsTitle: "name",
	},
	fields: [
		{
			name: "name",
			required: true,
			type: "text",
			unique: true,
		},
		{
			name: "type",
			options: [
				{ label: "Safe", value: "safe" },
				{ label: "Intimate", value: "intimate" },
			],
			required: true,
			type: "select",
		},
		{
			name: "sortOrder",
			required: true,
			type: "number",
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
	slug: "categories",
};
