import type { CollectionConfig } from 'payload';

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'stripeSubscriptionId',
    group: 'Players',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === 'users') return true;
      return { player: { equals: req.user.id } };
    },
    create: ({ req }) => !!req.user && req.user.collection === 'users',
    update: ({ req }) => !!req.user && req.user.collection === 'users',
    delete: ({ req }) => !!req.user && req.user.collection === 'users',
  },
  fields: [
    {
      name: 'player',
      type: 'relationship',
      relationTo: 'players',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      index: true,
    },
    {
      name: 'plan',
      type: 'select',
      required: true,
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Past Due', value: 'past_due' },
        { label: 'Trialing', value: 'trialing' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    {
      name: 'currentPeriodStart',
      type: 'date',
    },
    {
      name: 'currentPeriodEnd',
      type: 'date',
    },
    {
      name: 'cancelAtPeriodEnd',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'trialEnd',
      type: 'date',
    },
  ],
};
