import type { CollectionConfig } from 'payload';

export const QuestionSubmissions: CollectionConfig = {
  slug: 'question-submissions',
  admin: {
    useAsTitle: 'text',
    group: 'Content',
    description: 'User-submitted questions pending moderation',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === 'users') return true;
      return { submittedBy: { equals: req.user.id } };
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      required: true,
      maxLength: 300,
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
      name: 'submittedBy',
      type: 'relationship',
      relationTo: 'players',
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'moderatorNote',
      type: 'textarea',
      admin: { description: 'Internal note about why this was approved/rejected' },
    },
  ],
};
