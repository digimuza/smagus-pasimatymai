import type { CollectionConfig } from 'payload';

export const SpicyCardTypes: CollectionConfig = {
  slug: 'spicy-card-types',
  admin: {
    useAsTitle: 'label',
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
  ],
};
