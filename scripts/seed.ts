import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../drizzle/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
	const content = fs.readFileSync(envPath, "utf-8");
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eqIdx = trimmed.indexOf("=");
		if (eqIdx === -1) continue;
		const key = trimmed.slice(0, eqIdx);
		const value = trimmed.slice(eqIdx + 1);
		if (!process.env[key]) process.env[key] = value;
	}
}

const connectionString =
	process.env.DATABASE_URL ||
	"postgresql://payload:payload@localhost:5433/santykiuklausimai";

const migrationClient = postgres(connectionString, { max: 1 });
const queryClient = postgres(connectionString, { prepare: false });
const db = drizzle(queryClient, { schema });

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

const AUDIENCE_DEFS = [
	{
		color: "#9B59B6",
		description: "Klausimai, kurie padės geriau pažinti savo antrąją pusę",
		icon: "💜",
		isActive: true,
		name: "Poroms",
		slug: "romantic",
		sortOrder: 1,
	},
	{
		color: "#3498DB",
		description: "Šilti klausimai visai šeimai — nuo senelių iki vaikų",
		icon: "🏠",
		isActive: true,
		name: "Šeimai",
		slug: "family",
		sortOrder: 2,
	},
	{
		color: "#E67E22",
		description: "Klausimai draugų vakarams ir kompanijoms",
		icon: "🎉",
		isActive: true,
		name: "Draugams",
		slug: "friends",
		sortOrder: 3,
	},
	{
		color: "#2ECC71",
		description: "Linksmi ir saugūs klausimai mažiesiems",
		icon: "🌈",
		isActive: true,
		name: "Vaikams",
		slug: "kids",
		sortOrder: 4,
	},
];

async function seed() {
	console.log("Running migrations...");
	await migrate(drizzle(migrationClient), {
		migrationsFolder: path.resolve(__dirname, "../drizzle/migrations"),
	});
	console.log("Migrations complete.");

	// 1. Seed audiences
	console.log("\n--- Seeding audiences ---");
	for (const aud of AUDIENCE_DEFS) {
		const [existing] = await db
			.select({ id: schema.audiences.id })
			.from(schema.audiences)
			.where(
				eq(
					schema.audiences.slug,
					aud.slug as "romantic" | "family" | "kids" | "friends",
				),
			)
			.limit(1);

		if (existing) {
			console.log(`  Audience already exists: ${aud.slug}`);
		} else {
			await db.insert(schema.audiences).values(aud);
			console.log(`  Audience created: ${aud.slug}`);
		}
	}

	// 2. Seed romantic questions from data.json
	console.log("\n--- Seeding romantic questions ---");
	const dataPath = path.resolve(__dirname, "../public/data.json");
	const rawData = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as {
		sections: { name: string; questions: { id: number; question: string }[] }[];
	};

	const categoryIdMap = new Map<string, number>();
	let sortOrder = 1;

	for (const section of rawData.sections) {
		const type = INTIMATE_CATEGORY_NAMES.includes(section.name)
			? "intimate"
			: "safe";

		const [existing] = await db
			.select({ id: schema.categories.id })
			.from(schema.categories)
			.where(eq(schema.categories.name, section.name))
			.limit(1);

		let catId: number;
		if (existing) {
			catId = existing.id;
			console.log(`  Category exists: ${section.name}`);
		} else {
			const [cat] = await db
				.insert(schema.categories)
				.values({
					locale: "lt",
					name: section.name,
					sortOrder: sortOrder++,
					type,
				})
				.returning({ id: schema.categories.id });
			catId = cat.id;
			console.log(`  Category created: ${section.name} (${type})`);
		}
		categoryIdMap.set(section.name, catId);

		let created = 0;
		let skipped = 0;
		for (const q of section.questions) {
			const [existingQ] = await db
				.select({ id: schema.questions.id })
				.from(schema.questions)
				.where(eq(schema.questions.legacyId, q.id))
				.limit(1);

			if (existingQ) {
				skipped++;
				continue;
			}
			await db.insert(schema.questions).values({
				audience: "romantic",
				categoryId: catId,
				legacyId: q.id,
				locale: "lt",
				question: q.question,
				status: "published",
			});
			created++;
		}
		console.log(`    Questions: ${created} created, ${skipped} skipped`);
	}

	// 3. Seed spicy card types
	console.log("\n--- Seeding spicy card types ---");
	const typeIdMap = new Map<string, number>();

	for (const typeDef of SPICY_CARD_TYPE_DEFS) {
		const [existing] = await db
			.select({ id: schema.spicyCardTypes.id })
			.from(schema.spicyCardTypes)
			.where(eq(schema.spicyCardTypes.slug, typeDef.slug))
			.limit(1);

		if (existing) {
			typeIdMap.set(typeDef.slug, existing.id);
			console.log(`  Type exists: ${typeDef.slug}`);
		} else {
			const [created] = await db
				.insert(schema.spicyCardTypes)
				.values({ ...typeDef, locale: "lt" })
				.returning({ id: schema.spicyCardTypes.id });
			typeIdMap.set(typeDef.slug, created.id);
			console.log(`  Type created: ${typeDef.slug}`);
		}
	}

	// 4. Seed romantic spicy cards
	console.log("\n--- Seeding romantic spicy cards ---");
	const { SPICY_CARDS } = await import("../lib/spicyCardsData");
	let spicyCreated = 0;
	let spicySkipped = 0;

	for (const card of SPICY_CARDS) {
		const typeId = typeIdMap.get(card.type);
		if (!typeId) continue;

		const [existing] = await db
			.select({ id: schema.spicyCards.id })
			.from(schema.spicyCards)
			.where(
				and(
					eq(schema.spicyCards.cardTypeId, typeId),
					eq(schema.spicyCards.title, card.title),
				),
			)
			.limit(1);

		if (existing) {
			spicySkipped++;
			continue;
		}
		await db.insert(schema.spicyCards).values({
			audience: "romantic",
			cardTypeId: typeId,
			description: card.description,
			locale: "lt",
			status: "published",
			title: card.title,
		});
		spicyCreated++;
	}
	console.log(
		`  Spicy cards: ${spicyCreated} created, ${spicySkipped} skipped`,
	);

	// 5. Seed additional audience questions
	const AUDIENCE_DATA_FILES = [
		{ audience: "family" as const, file: "family-questions.json" },
		{ audience: "kids" as const, file: "kids-questions.json" },
		{ audience: "friends" as const, file: "friends-questions.json" },
	];

	for (const { audience, file } of AUDIENCE_DATA_FILES) {
		console.log(`\n--- Seeding ${audience} questions ---`);
		const filePath = path.resolve(__dirname, "data", file);
		const audienceData = JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
			sections: {
				name: string;
				type?: string;
				questions: { question: string }[];
			}[];
		};

		const [lastCat] = await db
			.select({ sortOrder: schema.categories.sortOrder })
			.from(schema.categories)
			.orderBy(schema.categories.sortOrder)
			.limit(1);
		let nextSort = (lastCat?.sortOrder ?? 0) + 1;

		for (const section of audienceData.sections) {
			const [existingCat] = await db
				.select({ id: schema.categories.id })
				.from(schema.categories)
				.where(eq(schema.categories.name, section.name))
				.limit(1);

			let catId: number;
			if (existingCat) {
				catId = existingCat.id;
				console.log(`  Category exists: ${section.name}`);
			} else {
				const [cat] = await db
					.insert(schema.categories)
					.values({
						locale: "lt",
						name: section.name,
						sortOrder: nextSort++,
						type: (section.type ?? "safe") as "safe" | "intimate",
					})
					.returning({ id: schema.categories.id });
				catId = cat.id;
				console.log(`  Category created: ${section.name}`);
			}

			let created = 0;
			let skipped = 0;
			for (const q of section.questions) {
				const [existingQ] = await db
					.select({ id: schema.questions.id })
					.from(schema.questions)
					.where(
						and(
							eq(schema.questions.categoryId, catId),
							eq(schema.questions.audience, audience),
							eq(schema.questions.question, q.question),
						),
					)
					.limit(1);

				if (existingQ) {
					skipped++;
					continue;
				}
				await db.insert(schema.questions).values({
					audience,
					categoryId: catId,
					locale: "lt",
					question: q.question,
					status: "published",
				});
				created++;
			}
			console.log(`    Questions: ${created} created, ${skipped} skipped`);
		}
	}

	// 6. Seed additional audience spicy cards
	const SPICY_DATA_FILES = [
		{ audience: "family" as const, file: "family-spicy-cards.json" },
		{ audience: "kids" as const, file: "kids-spicy-cards.json" },
		{ audience: "friends" as const, file: "friends-spicy-cards.json" },
	];

	for (const { audience, file } of SPICY_DATA_FILES) {
		console.log(`\n--- Seeding ${audience} spicy cards ---`);
		const filePath = path.resolve(__dirname, "data", file);
		const cards = JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
			type: string;
			title: string;
			description: string;
		}[];

		let created = 0;
		let skipped = 0;

		for (const card of cards) {
			const typeId = typeIdMap.get(card.type);
			if (!typeId) continue;

			const [existing] = await db
				.select({ id: schema.spicyCards.id })
				.from(schema.spicyCards)
				.where(
					and(
						eq(schema.spicyCards.audience, audience),
						eq(schema.spicyCards.title, card.title),
					),
				)
				.limit(1);

			if (existing) {
				skipped++;
				continue;
			}
			await db.insert(schema.spicyCards).values({
				audience,
				cardTypeId: typeId,
				description: card.description,
				locale: "lt",
				status: "published",
				title: card.title,
			});
			created++;
		}
		console.log(`  Spicy cards: ${created} created, ${skipped} skipped`);
	}

	console.log("\nSeed complete!");
	await migrationClient.end();
	await queryClient.end();
	process.exit(0);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
