import type { CollectionConfig } from 'payload';

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Safe', value: 'safe' },
        { label: 'Intimate', value: 'intimate' },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
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
  ],
};
