import type { CollectionConfig } from 'payload';

export const PlayerProgress: CollectionConfig = {
  slug: 'player-progress',
  admin: {
    group: 'Players',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === 'users') return true;
      return { player: { equals: req.user.id } };
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === 'users') return true;
      return { player: { equals: req.user.id } };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === 'users') return true;
      return { player: { equals: req.user.id } };
    },
  },
  fields: [
    {
      name: 'player',
      type: 'relationship',
      relationTo: 'players',
      required: true,
      index: true,
    },
    {
      name: 'questionId',
      type: 'number',
      required: true,
      index: true,
    },
    {
      name: 'audience',
      type: 'select',
      required: true,
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
      options: [
        { label: 'Answered', value: 'answered' },
        { label: 'Skipped', value: 'skipped' },
        { label: 'Superliked', value: 'superliked' },
      ],
    },
    {
      name: 'viewedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
  ],
};
