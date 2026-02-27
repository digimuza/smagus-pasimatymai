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
    if (e.message?.includes('unique') || e.message?.includes('duplicate')) {
      console.log('Admin user already exists, skipping');
    } else {
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

    try {
      const cat = await payload.create({
        collection: 'categories',
        data: {
          name: section.name,
          type,
          sortOrder: i + 1,
        },
      });
      categoryIdMap.set(section.name, cat.id);
      console.log(`Category created: ${section.name} (${type})`);
    } catch (e: any) {
      if (e.message?.includes('unique') || e.message?.includes('duplicate')) {
        const existing = await payload.find({
          collection: 'categories',
          where: { name: { equals: section.name } },
          limit: 1,
        });
        if (existing.docs[0]) {
          categoryIdMap.set(section.name, existing.docs[0].id);
          console.log(`Category already exists: ${section.name}`);
        }
      } else {
        throw e;
      }
    }

    // Create questions for this category
    const catId = categoryIdMap.get(section.name)!;
    for (const q of section.questions) {
      try {
        await payload.create({
          collection: 'questions',
          data: {
            question: q.question,
            category: catId,
            legacyId: q.id,
          },
        });
      } catch (e: any) {
        console.error(`Error creating question ${q.id}: ${e.message}`);
      }
    }
    console.log(`  Created ${section.questions.length} questions`);
  }

  // 3. Create spicy card types
  const typeIdMap = new Map<string, number>();

  for (const typeDef of SPICY_CARD_TYPE_DEFS) {
    try {
      const created = await payload.create({
        collection: 'spicy-card-types',
        data: typeDef,
      });
      typeIdMap.set(typeDef.slug, created.id);
      console.log(`Spicy card type created: ${typeDef.slug}`);
    } catch (e: any) {
      if (e.message?.includes('unique') || e.message?.includes('duplicate')) {
        const existing = await payload.find({
          collection: 'spicy-card-types',
          where: { slug: { equals: typeDef.slug } },
          limit: 1,
        });
        if (existing.docs[0]) {
          typeIdMap.set(typeDef.slug, existing.docs[0].id);
          console.log(`Spicy card type already exists: ${typeDef.slug}`);
        }
      } else {
        throw e;
      }
    }
  }

  // 4. Import spicy cards from spicyCardsData
  // We import the array data inline since it's a TS module
  const { SPICY_CARDS } = await import('../lib/spicyCardsData');

  let spicyCount = 0;
  for (const card of SPICY_CARDS) {
    const typeId = typeIdMap.get(card.type);
    if (!typeId) {
      console.error(`Unknown card type: ${card.type}`);
      continue;
    }

    try {
      await payload.create({
        collection: 'spicy-cards',
        data: {
          title: card.title,
          description: card.description,
          cardType: typeId,
        },
      });
      spicyCount++;
    } catch (e: any) {
      console.error(`Error creating spicy card ${card.id}: ${e.message}`);
    }
  }
  console.log(`Created ${spicyCount} spicy cards`);

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
