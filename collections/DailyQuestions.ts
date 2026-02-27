import type { CollectionConfig } from 'payload';

export const DailyQuestions: CollectionConfig = {
  slug: 'daily-questions',
  admin: {
    useAsTitle: 'date',
    group: 'Content',
    description: 'Daily featured question for each audience',
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    {
      name: 'date',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'YYYY-MM-DD format' },
    },
    {
      name: 'question',
      type: 'relationship',
      relationTo: 'questions',
      required: true,
    },
    {
      name: 'audience',
      type: 'select',
      required: true,
      defaultValue: 'romantic',
      options: [
        { label: 'Romantic', value: 'romantic' },
        { label: 'Family', value: 'family' },
        { label: 'Kids', value: 'kids' },
        { label: 'Friends', value: 'friends' },
      ],
    },
  ],
};
