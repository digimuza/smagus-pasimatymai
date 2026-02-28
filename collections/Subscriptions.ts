import type { CollectionConfig } from "payload";

export const Subscriptions: CollectionConfig = {
	access: {
		create: ({ req }) => !!req.user && req.user.collection === "users",
		delete: ({ req }) => !!req.user && req.user.collection === "users",
		read: ({ req }) => {
			if (!req.user) return false;
			if (req.user.collection === "users") return true;
			return { player: { equals: req.user.id } };
		},
		update: ({ req }) => !!req.user && req.user.collection === "users",
	},
	admin: {
		group: "Players",
		useAsTitle: "stripeSubscriptionId",
	},
	fields: [
		{
			index: true,
			name: "player",
			relationTo: "players",
			required: true,
			type: "relationship",
			unique: true,
		},
		{
			index: true,
			name: "stripeCustomerId",
			required: true,
			type: "text",
		},
		{
			index: true,
			name: "stripeSubscriptionId",
			type: "text",
		},
		{
			defaultValue: "free",
			name: "plan",
			options: [
				{ label: "Free", value: "free" },
				{ label: "Monthly", value: "monthly" },
				{ label: "Yearly", value: "yearly" },
			],
			required: true,
			type: "select",
		},
		{
			defaultValue: "active",
			name: "status",
			options: [
				{ label: "Active", value: "active" },
				{ label: "Canceled", value: "canceled" },
				{ label: "Past Due", value: "past_due" },
				{ label: "Trialing", value: "trialing" },
				{ label: "Expired", value: "expired" },
			],
			required: true,
			type: "select",
		},
		{
			name: "currentPeriodStart",
			type: "date",
		},
		{
			name: "currentPeriodEnd",
			type: "date",
		},
		{
			defaultValue: false,
			name: "cancelAtPeriodEnd",
			type: "checkbox",
		},
		{
			name: "trialEnd",
			type: "date",
		},
	],
	slug: "subscriptions",
};
