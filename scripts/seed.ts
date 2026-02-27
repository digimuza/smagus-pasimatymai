// Load env vars before any payload imports (workaround for @next/env + tsx incompatibility)
import './load-env';

import { getPayload } from 'payload';
import config from '../payload.config';
import * as fs from 'fs';
import * as path from 'path';

const INTIMATE_CATEGORY_NAMES = [
  'Intymūs klausimai',
  'Gilūs intymūs klausimai',
  'Atviri klausimai apie seksą',
];

const SPICY_CARD_TYPE_DEFS = [
  { slug: 'kiss', label: 'Bučinys 💋', icon: '💋', color: '#FF6B9D' },
  { slug: 'challenge', label: 'Iššūkis 🎯', icon: '🎯', color: '#FFA500' },
  { slug: 'compliment', label: 'Komplimentas 💝', icon: '💝', color: '#C77DFF' },
  { slug: 'massage', label: 'Masažas 💆', icon: '💆', color: '#7B68EE' },
  { slug: 'slap', label: 'Žaismingas 👋', icon: '👋', color: '#FF6347' },
  { slug: 'whisper', label: 'Šnibždesys 🤫', icon: '🤫', color: '#FF1493' },
  { slug: 'dare', label: 'Išdrįsk 🔥', icon: '🔥', color: '#FF4500' },
  { slug: 'truth', label: 'Tiesa 💭', icon: '💭', color: '#4169E1' },
  { slug: 'hug', label: 'Apkabinimas 🤗', icon: '🤗', color: '#FFB6C1' },
  { slug: 'dance', label: 'Šokis 💃', icon: '💃', color: '#DA70D6' },
];

async function seed() {
  const payload = await getPayload({ config });

  console.log('Starting seed...');

  // 1. Create admin user
  const existingUsers = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@santykiuklausimai.lt' } },
    limit: 1,
  });

  if (existingUsers.docs.length > 0) {
    console.log('Admin user already exists, skipping');
  } else {
    try {
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@santykiuklausimai.lt',
          password: 'changeme123',
        },
      });
      console.log('Admin user created');
    } catch (e: any) {
      console.error('Error creating admin user:', e.message);
    }
  }

  // 2. Read data.json and create categories + questions
  const dataPath = path.resolve(__dirname, '../public/data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  const categoryIdMap = new Map<string, number>();

  for (let i = 0; i < data.sections.length; i++) {
    const section = data.sections[i];
    const type = INTIMATE_CATEGORY_NAMES.includes(section.name) ? 'intimate' : 'safe';

    const existingCat = await payload.find({
      collection: 'categories',
      where: { name: { equals: section.name } },
      limit: 1,
    });

    if (existingCat.docs.length > 0) {
      categoryIdMap.set(section.name, existingCat.docs[0].id);
      console.log(`Category already exists: ${section.name}`);
    } else {
      const cat = await payload.create({
        collection: 'categories',
        data: {
          name: section.name,
          type,
          sortOrder: i + 1,
          locale: 'lt',
        },
      });
      categoryIdMap.set(section.name, cat.id);
      console.log(`Category created: ${section.name} (${type})`);
    }

    // Create questions for this category (idempotent by legacyId)
    const catId = categoryIdMap.get(section.name)!;
    let createdCount = 0;
    let skippedCount = 0;

    for (const q of section.questions) {
      const existing = await payload.find({
        collection: 'questions',
        where: { legacyId: { equals: q.id } },
        limit: 1,
      });

      if (existing.docs.length > 0) {
        skippedCount++;
        continue;
      }

      try {
        await payload.create({
          collection: 'questions',
          data: {
            question: q.question,
            category: catId,
            legacyId: q.id,
            locale: 'lt',
            audience: 'romantic',
            status: 'published',
          },
        });
        createdCount++;
      } catch (e: any) {
        console.error(`Error creating question ${q.id}: ${e.message}`);
      }
    }
    console.log(`  Questions: ${createdCount} created, ${skippedCount} skipped (already exist)`);
  }

  // 3. Create spicy card types (idempotent by slug unique constraint)
  const typeIdMap = new Map<string, number>();

  for (const typeDef of SPICY_CARD_TYPE_DEFS) {
    const existingType = await payload.find({
      collection: 'spicy-card-types',
      where: { slug: { equals: typeDef.slug } },
      limit: 1,
    });

    if (existingType.docs.length > 0) {
      typeIdMap.set(typeDef.slug, existingType.docs[0].id);
      console.log(`Spicy card type already exists: ${typeDef.slug}`);
    } else {
      const created = await payload.create({
        collection: 'spicy-card-types',
        data: {
          ...typeDef,
          locale: 'lt',
        },
      });
      typeIdMap.set(typeDef.slug, created.id);
      console.log(`Spicy card type created: ${typeDef.slug}`);
    }
  }

  // 4. Import spicy cards (idempotent by title + cardType)
  const { SPICY_CARDS } = await import('../lib/spicyCardsData');

  let spicyCreated = 0;
  let spicySkipped = 0;

  for (const card of SPICY_CARDS) {
    const typeId = typeIdMap.get(card.type);
    if (!typeId) {
      console.error(`Unknown card type: ${card.type}`);
      continue;
    }

    const existing = await payload.find({
      collection: 'spicy-cards',
      where: {
        title: { equals: card.title },
        cardType: { equals: typeId },
      },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      spicySkipped++;
      continue;
    }

    try {
      await payload.create({
        collection: 'spicy-cards',
        data: {
          title: card.title,
          description: card.description,
          cardType: typeId,
          locale: 'lt',
          audience: 'romantic',
          status: 'published',
        },
      });
      spicyCreated++;
    } catch (e: any) {
      console.error(`Error creating spicy card ${card.id}: ${e.message}`);
    }
  }
  console.log(`Spicy cards: ${spicyCreated} created, ${spicySkipped} skipped (already exist)`);

  // 5. Seed Audiences collection
  const AUDIENCE_DEFS = [
    { slug: 'romantic', name: 'Poroms', description: 'Klausimai, kurie padės geriau pažinti savo antrąją pusę', icon: '💜', color: '#9B59B6', sortOrder: 1 },
    { slug: 'family', name: 'Šeimai', description: 'Šilti klausimai visai šeimai — nuo senelių iki vaikų', icon: '🏠', color: '#3498DB', sortOrder: 2 },
    { slug: 'friends', name: 'Draugams', description: 'Klausimai draugų vakarams ir kompanijoms', icon: '🎉', color: '#E67E22', sortOrder: 3 },
    { slug: 'kids', name: 'Vaikams', description: 'Linksmi ir saugūs klausimai mažiesiems', icon: '🌈', color: '#2ECC71', sortOrder: 4 },
  ];

  console.log('\n--- Seeding Audiences ---');
  for (const aud of AUDIENCE_DEFS) {
    const existing = await payload.find({
      collection: 'audiences',
      where: { slug: { equals: aud.slug } },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      console.log(`Audience already exists: ${aud.slug}`);
    } else {
      await payload.create({
        collection: 'audiences',
        data: { ...aud, isActive: true },
      });
      console.log(`Audience created: ${aud.slug}`);
    }
  }

  // 6. Seed new audience questions from JSON files
  const AUDIENCE_DATA_FILES: { audience: string; file: string }[] = [
    { audience: 'family', file: 'family-questions.json' },
    { audience: 'kids', file: 'kids-questions.json' },
    { audience: 'friends', file: 'friends-questions.json' },
  ];

  for (const { audience, file } of AUDIENCE_DATA_FILES) {
    console.log(`\n--- Seeding ${audience} questions ---`);
    const filePath = path.resolve(__dirname, 'data', file);
    const rawJson = fs.readFileSync(filePath, 'utf-8');
    const audienceData = JSON.parse(rawJson);

    // Track max sortOrder for new categories
    const existingCats = await payload.find({
      collection: 'categories',
      sort: '-sortOrder',
      limit: 1,
    });
    let nextSortOrder = (existingCats.docs[0]?.sortOrder || 0) + 1;

    for (const section of audienceData.sections) {
      // Find or create category
      const existingCat = await payload.find({
        collection: 'categories',
        where: { name: { equals: section.name } },
        limit: 1,
      });

      let catId: number;
      if (existingCat.docs.length > 0) {
        catId = existingCat.docs[0].id;
        console.log(`  Category already exists: ${section.name}`);
      } else {
        const cat = await payload.create({
          collection: 'categories',
          data: {
            name: section.name,
            type: section.type || 'safe',
            sortOrder: nextSortOrder++,
            locale: 'lt',
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
          collection: 'questions',
          where: {
            question: { equals: q.question },
            audience: { equals: audience },
            category: { equals: catId },
          },
          limit: 1,
        });

        if (existing.docs.length > 0) {
          skippedQ++;
          continue;
        }

        try {
          await payload.create({
            collection: 'questions',
            data: {
              question: q.question,
              category: catId,
              locale: 'lt',
              audience: audience as 'romantic' | 'family' | 'kids' | 'friends',
              status: 'published',
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
    { audience: 'family', file: 'family-spicy-cards.json' },
    { audience: 'kids', file: 'kids-spicy-cards.json' },
    { audience: 'friends', file: 'friends-spicy-cards.json' },
  ];

  for (const { audience, file } of SPICY_DATA_FILES) {
    console.log(`\n--- Seeding ${audience} spicy cards ---`);
    const filePath = path.resolve(__dirname, 'data', file);
    const rawJson = fs.readFileSync(filePath, 'utf-8');
    const cards: { type: string; title: string; description: string }[] = JSON.parse(rawJson);

    let createdSC = 0;
    let skippedSC = 0;

    for (const card of cards) {
      const typeId = typeIdMap.get(card.type);
      if (!typeId) {
        console.error(`  Unknown card type: ${card.type}`);
        continue;
      }

      const existing = await payload.find({
        collection: 'spicy-cards',
        where: {
          title: { equals: card.title },
          audience: { equals: audience },
        },
        limit: 1,
      });

      if (existing.docs.length > 0) {
        skippedSC++;
        continue;
      }

      try {
        await payload.create({
          collection: 'spicy-cards',
          data: {
            title: card.title,
            description: card.description,
            cardType: typeId,
            locale: 'lt',
            audience: audience as 'romantic' | 'family' | 'kids' | 'friends',
            status: 'published',
          },
        });
        createdSC++;
      } catch (e: any) {
        console.error(`  Error creating ${audience} spicy card: ${e.message}`);
      }
    }
    console.log(`  Spicy cards: ${createdSC} created, ${skippedSC} skipped`);
  }

  console.log('\nSeed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
