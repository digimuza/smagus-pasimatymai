import type { CollectionConfig } from 'payload';

export const SpicyCards: CollectionConfig = {
  slug: 'spicy-cards',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      required: true,
    },
    {
      name: 'cardType',
      type: 'relationship',
      relationTo: 'spicy-card-types',
      required: true,
    },
  ],
};
