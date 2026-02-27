import type { CollectionConfig } from 'payload';

export const Questions: CollectionConfig = {
  slug: 'questions',
  admin: {
    useAsTitle: 'question',
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'legacyId',
      type: 'number',
      index: true,
    },
  ],
};
