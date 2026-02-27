import type { CollectionConfig } from 'payload';

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
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
  ],
};
