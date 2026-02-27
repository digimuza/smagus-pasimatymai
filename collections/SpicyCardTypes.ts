import type { CollectionConfig } from 'payload';

export const SpicyCardTypes: CollectionConfig = {
  slug: 'spicy-card-types',
  admin: {
    useAsTitle: 'label',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'icon',
      type: 'text',
      required: true,
    },
    {
      name: 'color',
      type: 'text',
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
