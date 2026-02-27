import type { CollectionConfig } from 'payload';

export const Questions: CollectionConfig = {
  slug: 'questions',
  admin: {
    useAsTitle: 'question',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
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
    {
      name: 'locale',
      type: 'select',
      required: true,
      defaultValue: 'lt',
      options: [
        { label: 'Lietuvių', value: 'lt' },
        { label: 'English', value: 'en' },
      ],
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
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
};
