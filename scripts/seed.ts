// Load env vars before any payload imports (workaround for @next/env + tsx incompatibility)
import "./load-env";

import * as fs from "node:fs";
import * as path from "node:path";
import { getPayload } from "payload";
import config from "../payload.config";

const INTIMATE_CATEGORY_NAMES = [
	"Intymūs klausimai",
	"Gilūs intymūs klausimai",
	"Atviri klausimai apie seksą",
];

const SPICY_CARD_TYPE_DEFS = [
	{ color: "#FF6B9D", icon: "💋", label: "Bučinys 💋", slug: "kiss" },
	{ color: "#FFA500", icon: "🎯", label: "Iššūkis 🎯", slug: "challenge" },
	{
		color: "#C77DFF",
		icon: "💝",
		label: "Komplimentas 💝",
		slug: "compliment",
	},
	{ color: "#7B68EE", icon: "💆", label: "Masažas 💆", slug: "massage" },
	{ color: "#FF6347", icon: "👋", label: "Žaismingas 👋", slug: "slap" },
	{ color: "#FF1493", icon: "🤫", label: "Šnibždesys 🤫", slug: "whisper" },
	{ color: "#FF4500", icon: "🔥", label: "Išdrįsk 🔥", slug: "dare" },
	{ color: "#4169E1", icon: "💭", label: "Tiesa 💭", slug: "truth" },
	{ color: "#FFB6C1", icon: "🤗", label: "Apkabinimas 🤗", slug: "hug" },
	{ color: "#DA70D6", icon: "💃", label: "Šokis 💃", slug: "dance" },
];

async function seed() {
	const payload = await getPayload({ config });

	console.log("Starting seed...");

	// 1. Create admin user
	const existingUsers = await payload.find({
		collection: "users",
		limit: 1,
		where: { email: { equals: "admin@santykiuklausimai.lt" } },
	});

	if (existingUsers.docs.length > 0) {
		console.log("Admin user already exists, skipping");
	} else {
		try {
			await payload.create({
				collection: "users",
				data: {
					email: "admin@santykiuklausimai.lt",
					password: "changeme123",
				},
			});
			console.log("Admin user created");
		} catch (e: any) {
			console.error("Error creating admin user:", e.message);
		}
	}

	// 2. Read data.json and create categories + questions
	const dataPath = path.resolve(__dirname, "../public/data.json");
	const rawData = fs.readFileSync(dataPath, "utf-8");
	const data = JSON.parse(rawData);

	const categoryIdMap = new Map<string, number>();

	for (let i = 0; i < data.sections.length; i++) {
		const section = data.sections[i];
		const type = INTIMATE_CATEGORY_NAMES.includes(section.name)
			? "intimate"
			: "safe";

		const existingCat = await payload.find({
			collection: "categories",
			limit: 1,
			where: { name: { equals: section.name } },
		});

		if (existingCat.docs.length > 0) {
			categoryIdMap.set(section.name, existingCat.docs[0].id);
			console.log(`Category already exists: ${section.name}`);
		} else {
			const cat = await payload.create({
				collection: "categories",
				data: {
					locale: "lt",
					name: section.name,
					sortOrder: i + 1,
					type,
				},
			});
			categoryIdMap.set(section.name, cat.id);
			console.log(`Category created: ${section.name} (${type})`);
		}

		// Create questions for this category (idempotent by legacyId)
		const catId = categoryIdMap.get(section.name) as number;
		let createdCount = 0;
		let skippedCount = 0;

		for (const q of section.questions) {
			const existing = await payload.find({
				collection: "questions",
				limit: 1,
				where: { legacyId: { equals: q.id } },
			});

			if (existing.docs.length > 0) {
				skippedCount++;
				continue;
			}

			try {
				await payload.create({
					collection: "questions",
					data: {
						audience: "romantic",
						category: catId,
						legacyId: q.id,
						locale: "lt",
						question: q.question,
						status: "published",
					},
				});
				createdCount++;
			} catch (e: any) {
				console.error(`Error creating question ${q.id}: ${e.message}`);
			}
		}
		console.log(
			`  Questions: ${createdCount} created, ${skippedCount} skipped (already exist)`,
		);
	}

	// 3. Create spicy card types (idempotent by slug unique constraint)
	const typeIdMap = new Map<string, number>();

	for (const typeDef of SPICY_CARD_TYPE_DEFS) {
		const existingType = await payload.find({
			collection: "spicy-card-types",
			limit: 1,
			where: { slug: { equals: typeDef.slug } },
		});

		if (existingType.docs.length > 0) {
			typeIdMap.set(typeDef.slug, existingType.docs[0].id);
			console.log(`Spicy card type already exists: ${typeDef.slug}`);
		} else {
			const created = await payload.create({
				collection: "spicy-card-types",
				data: {
					...typeDef,
					locale: "lt",
				},
			});
			typeIdMap.set(typeDef.slug, created.id);
			console.log(`Spicy card type created: ${typeDef.slug}`);
		}
	}

	// 4. Import spicy cards (idempotent by title + cardType)
	const { SPICY_CARDS } = await import("../lib/spicyCardsData");

	let spicyCreated = 0;
	let spicySkipped = 0;

	for (const card of SPICY_CARDS) {
		const typeId = typeIdMap.get(card.type);
		if (!typeId) {
			console.error(`Unknown card type: ${card.type}`);
			continue;
		}

		const existing = await payload.find({
			collection: "spicy-cards",
			limit: 1,
			where: {
				cardType: { equals: typeId },
				title: { equals: card.title },
			},
		});

		if (existing.docs.length > 0) {
			spicySkipped++;
			continue;
		}

		try {
			await payload.create({
				collection: "spicy-cards",
				data: {
					audience: "romantic",
					cardType: typeId,
					description: card.description,
					locale: "lt",
					status: "published",
					title: card.title,
				},
			});
			spicyCreated++;
		} catch (e: any) {
			console.error(`Error creating spicy card ${card.id}: ${e.message}`);
		}
	}
	console.log(
		`Spicy cards: ${spicyCreated} created, ${spicySkipped} skipped (already exist)`,
	);

	// 5. Seed Audiences collection
	const AUDIENCE_DEFS = [
		{
			color: "#9B59B6",
			description: "Klausimai, kurie padės geriau pažinti savo antrąją pusę",
			icon: "💜",
			name: "Poroms",
			slug: "romantic",
			sortOrder: 1,
		},
		{
			color: "#3498DB",
			description: "Šilti klausimai visai šeimai — nuo senelių iki vaikų",
			icon: "🏠",
			name: "Šeimai",
			slug: "family",
			sortOrder: 2,
		},
		{
			color: "#E67E22",
			description: "Klausimai draugų vakarams ir kompanijoms",
			icon: "🎉",
			name: "Draugams",
			slug: "friends",
			sortOrder: 3,
		},
		{
			color: "#2ECC71",
			description: "Linksmi ir saugūs klausimai mažiesiems",
			icon: "🌈",
			name: "Vaikams",
			slug: "kids",
			sortOrder: 4,
		},
	];

	console.log("\n--- Seeding Audiences ---");
	for (const aud of AUDIENCE_DEFS) {
		const existing = await payload.find({
			collection: "audiences",
			limit: 1,
			where: { slug: { equals: aud.slug } },
		});

		if (existing.docs.length > 0) {
			console.log(`Audience already exists: ${aud.slug}`);
		} else {
			await payload.create({
				collection: "audiences",
				data: { ...aud, isActive: true },
			});
			console.log(`Audience created: ${aud.slug}`);
		}
	}

	// 6. Seed new audience questions from JSON files
	const AUDIENCE_DATA_FILES: { audience: string; file: string }[] = [
		{ audience: "family", file: "family-questions.json" },
		{ audience: "kids", file: "kids-questions.json" },
		{ audience: "friends", file: "friends-questions.json" },
	];

	for (const { audience, file } of AUDIENCE_DATA_FILES) {
		console.log(`\n--- Seeding ${audience} questions ---`);
		const filePath = path.resolve(__dirname, "data", file);
		const rawJson = fs.readFileSync(filePath, "utf-8");
		const audienceData = JSON.parse(rawJson);

		// Track max sortOrder for new categories
		const existingCats = await payload.find({
			collection: "categories",
			limit: 1,
			sort: "-sortOrder",
		});
		let nextSortOrder = (existingCats.docs[0]?.sortOrder || 0) + 1;

		for (const section of audienceData.sections) {
			// Find or create category
			const existingCat = await payload.find({
				collection: "categories",
				limit: 1,
				where: { name: { equals: section.name } },
			});

			let catId: number;
			if (existingCat.docs.length > 0) {
				catId = existingCat.docs[0].id;
				console.log(`  Category already exists: ${section.name}`);
			} else {
				const cat = await payload.create({
					collection: "categories",
					data: {
						locale: "lt",
						name: section.name,
						sortOrder: nextSortOrder++,
						type: section.type || "safe",
					},
				});
				catId = cat.id;
				console.log(`  Category created: ${section.name}`);
			}

			// Create questions (idempotent by question text + audience + category)
			let createdQ = 0;
			let skippedQ = 0;

			for (const q of section.questions) {
				const existing = await payload.find({
					collection: "questions",
					limit: 1,
					where: {
						audience: { equals: audience },
						category: { equals: catId },
						question: { equals: q.question },
					},
				});

				if (existing.docs.length > 0) {
					skippedQ++;
					continue;
				}

				try {
					await payload.create({
						collection: "questions",
						data: {
							audience: audience as "romantic" | "family" | "kids" | "friends",
							category: catId,
							locale: "lt",
							question: q.question,
							status: "published",
						},
					});
					createdQ++;
				} catch (e: any) {
					console.error(`  Error creating ${audience} question: ${e.message}`);
				}
			}
			console.log(`    Questions: ${createdQ} created, ${skippedQ} skipped`);
		}
	}

	// 7. Seed new audience spicy cards from JSON files
	const SPICY_DATA_FILES: { audience: string; file: string }[] = [
		{ audience: "family", file: "family-spicy-cards.json" },
		{ audience: "kids", file: "kids-spicy-cards.json" },
		{ audience: "friends", file: "friends-spicy-cards.json" },
	];

	for (const { audience, file } of SPICY_DATA_FILES) {
		console.log(`\n--- Seeding ${audience} spicy cards ---`);
		const filePath = path.resolve(__dirname, "data", file);
		const rawJson = fs.readFileSync(filePath, "utf-8");
		const cards: { type: string; title: string; description: string }[] =
			JSON.parse(rawJson);

		let createdSC = 0;
		let skippedSC = 0;

		for (const card of cards) {
			const typeId = typeIdMap.get(card.type);
			if (!typeId) {
				console.error(`  Unknown card type: ${card.type}`);
				continue;
			}

			const existing = await payload.find({
				collection: "spicy-cards",
				limit: 1,
				where: {
					audience: { equals: audience },
					title: { equals: card.title },
				},
			});

			if (existing.docs.length > 0) {
				skippedSC++;
				continue;
			}

			try {
				await payload.create({
					collection: "spicy-cards",
					data: {
						audience: audience as "romantic" | "family" | "kids" | "friends",
						cardType: typeId,
						description: card.description,
						locale: "lt",
						status: "published",
						title: card.title,
					},
				});
				createdSC++;
			} catch (e: any) {
				console.error(`  Error creating ${audience} spicy card: ${e.message}`);
			}
		}
		console.log(`  Spicy cards: ${createdSC} created, ${skippedSC} skipped`);
	}

	console.log("\nSeed complete!");
	process.exit(0);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
