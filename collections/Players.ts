import type { CollectionConfig } from "payload";

export const Players: CollectionConfig = {
	access: {
		create: () => true, // Public registration
		delete: ({ req }) => {
			if (!req.user) return false;
			if (req.user.collection === "users") return true;
			return { id: { equals: req.user.id } };
		},
		read: ({ req }) => {
			if (!req.user) return false;
			// Admin users can read all players
			if (req.user.collection === "users") return true;
			// Players can only read their own record
			return { id: { equals: req.user.id } };
		},
		update: ({ req }) => {
			if (!req.user) return false;
			if (req.user.collection === "users") return true;
			return { id: { equals: req.user.id } };
		},
	},
	admin: {
		group: "Players",
		useAsTitle: "email",
	},
	auth: {
		cookies: {
			sameSite: "Lax",
			secure: process.env.NODE_ENV === "production",
		},
		tokenExpiration: 60 * 60 * 24 * 30, // 30 days
	},
	fields: [
		{
			name: "name",
			type: "text",
		},
		{
			admin: {
				description: "URL to avatar image (from OAuth provider or Gravatar)",
			},
			name: "avatar",
			type: "text",
		},
		{
			defaultValue: "email",
			name: "provider",
			options: [
				{ label: "Email", value: "email" },
				{ label: "Google", value: "google" },
				{ label: "Apple", value: "apple" },
			],
			type: "select",
		},
		{
			admin: {
				description: "OAuth subject ID from provider",
			},
			index: true,
			name: "providerId",
			type: "text",
		},
		{
			defaultValue: "lt",
			name: "locale",
			options: [
				{ label: "Lietuviu", value: "lt" },
				{ label: "English", value: "en" },
			],
			type: "select",
		},
		{
			name: "preferredAudience",
			options: [
				{ label: "Romantic", value: "romantic" },
				{ label: "Family", value: "family" },
				{ label: "Kids", value: "kids" },
				{ label: "Friends", value: "friends" },
			],
			type: "select",
		},
		{
			admin: {
				description: "Array of active category names",
			},
			name: "activeCategories",
			type: "json",
		},
		{
			admin: { description: "Current consecutive days played" },
			defaultValue: 0,
			name: "currentStreak",
			type: "number",
		},
		{
			admin: { description: "Longest streak ever achieved" },
			defaultValue: 0,
			name: "longestStreak",
			type: "number",
		},
		{
			admin: { description: "YYYY-MM-DD of last play session" },
			name: "lastPlayedDate",
			type: "text",
		},
		{
			fields: [
				{
					defaultValue: true,
					name: "enabled",
					type: "checkbox",
				},
				{
					defaultValue: "medium",
					name: "rarity",
					options: [
						{ label: "Rare", value: "rare" },
						{ label: "Medium", value: "medium" },
						{ label: "Frequent", value: "frequent" },
						{ label: "Ultra", value: "ultra" },
					],
					type: "select",
				},
				{
					admin: {
						description: "Array of enabled spicy card type slugs",
					},
					name: "enabledTypes",
					type: "json",
				},
			],
			name: "spicySettings",
			type: "group",
		},
	],
	slug: "players",
};
