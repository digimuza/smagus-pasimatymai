import type { CollectionConfig } from 'payload';

export const GameSessions: CollectionConfig = {
  slug: 'game-sessions',
  admin: {
    useAsTitle: 'sessionId',
  },
  access: {
    create: () => true,
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'sessionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'startedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'endedAt',
      type: 'date',
    },
    {
      name: 'audience',
      type: 'select',
      options: [
        { label: 'Romantic', value: 'romantic' },
        { label: 'Family', value: 'family' },
        { label: 'Kids', value: 'kids' },
        { label: 'Friends', value: 'friends' },
      ],
    },
    {
      name: 'locale',
      type: 'select',
      options: [
        { label: 'Lietuviu', value: 'lt' },
        { label: 'English', value: 'en' },
      ],
    },
    {
      name: 'questionsViewed',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'questionsSkipped',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'spicyCardsViewed',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'duration',
      type: 'number',
    },
    {
      name: 'device',
      type: 'text',
    },
  ],
};
