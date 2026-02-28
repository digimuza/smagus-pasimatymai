import type { CollectionConfig } from "payload";

export const Audiences: CollectionConfig = {
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
			name: "slug",
			required: true,
			type: "text",
			unique: true,
		},
		{
			name: "name",
			required: true,
			type: "text",
		},
		{
			name: "description",
			required: true,
			type: "textarea",
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
			defaultValue: true,
			name: "isActive",
			type: "checkbox",
		},
		{
			defaultValue: 0,
			name: "sortOrder",
			required: true,
			type: "number",
		},
	],
	slug: "audiences",
};
