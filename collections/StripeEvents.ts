import type { CollectionConfig } from "payload";

export const StripeEvents: CollectionConfig = {
	access: {
		create: () => false,
		delete: ({ req }) => !!req.user && req.user.collection === "users",
		read: ({ req }) => !!req.user && req.user.collection === "users",
		update: () => false,
	},
	admin: {
		group: "System",
	},
	fields: [
		{
			index: true,
			name: "eventId",
			required: true,
			type: "text",
			unique: true,
		},
		{
			name: "eventType",
			required: true,
			type: "text",
		},
	],
	slug: "stripe-events",
};
