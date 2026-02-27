import type { CollectionConfig } from 'payload';

export const QuestionEvents: CollectionConfig = {
  slug: 'question-events',
  admin: {
    useAsTitle: 'eventType',
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
      index: true,
    },
    {
      name: 'questionId',
      type: 'number',
      required: true,
      index: true,
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Viewed', value: 'viewed' },
        { label: 'Skipped', value: 'skipped' },
        { label: 'Answered', value: 'answered' },
        { label: 'Superliked', value: 'superliked' },
        { label: 'Spicy Dismissed', value: 'spicy_dismissed' },
      ],
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'timeSpent',
      type: 'number',
    },
  ],
};
