import { getPayloadClient } from './payload';

export async function getAllCategoriesWithQuestions() {
  const payload = await getPayloadClient();

  const categories = await payload.find({
    collection: 'categories',
    sort: 'sortOrder',
    limit: 100,
  });

  const sections = await Promise.all(
    categories.docs.map(async (cat) => {
      const questions = await payload.find({
        collection: 'questions',
        where: { category: { equals: cat.id } },
        limit: 1000,
        sort: 'legacyId',
      });

      return {
        name: cat.name,
        type: cat.type as 'safe' | 'intimate',
        range: `${questions.docs.length} klausimų`,
        questions: questions.docs.map((q) => ({
          id: q.id,
          question: q.question,
        })),
      };
    })
  );

  return sections;
}

export async function getAllSpicyCards() {
  const payload = await getPayloadClient();

  const cards = await payload.find({
    collection: 'spicy-cards',
    limit: 1000,
    depth: 1,
  });

  return cards.docs.map((card) => {
    const cardType = card.cardType as { slug: string; icon: string; color: string } | number;
    const isPopulated = typeof cardType !== 'number';

    return {
      id: String(card.id),
      type: isPopulated ? cardType.slug : '',
      title: card.title,
      description: card.description,
      icon: isPopulated ? cardType.icon : '',
      color: isPopulated ? cardType.color : '',
    };
  });
}
