import type { CollectionConfig } from 'payload';

export const Players: CollectionConfig = {
  slug: 'players',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  admin: {
    useAsTitle: 'email',
    group: 'Players',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      // Admin users can read all players
      if (req.user.collection === 'users') return true;
      // Players can only read their own record
      return { id: { equals: req.user.id } };
    },
    create: () => true, // Public registration
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === 'users') return true;
      return { id: { equals: req.user.id } };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === 'users') return true;
      return { id: { equals: req.user.id } };
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'avatar',
      type: 'text',
      admin: {
        description: 'URL to avatar image (from OAuth provider or Gravatar)',
      },
    },
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'email',
      options: [
        { label: 'Email', value: 'email' },
        { label: 'Google', value: 'google' },
        { label: 'Apple', value: 'apple' },
      ],
    },
    {
      name: 'providerId',
      type: 'text',
      admin: {
        description: 'OAuth subject ID from provider',
      },
      index: true,
    },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'lt',
      options: [
        { label: 'Lietuviu', value: 'lt' },
        { label: 'English', value: 'en' },
      ],
    },
    {
      name: 'preferredAudience',
      type: 'select',
      options: [
        { label: 'Romantic', value: 'romantic' },
        { label: 'Family', value: 'family' },
        { label: 'Kids', value: 'kids' },
        { label: 'Friends', value: 'friends' },
      ],
    },
    {
      name: 'activeCategories',
      type: 'json',
      admin: {
        description: 'Array of active category names',
      },
    },
    {
      name: 'spicySettings',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'rarity',
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'Rare', value: 'rare' },
            { label: 'Medium', value: 'medium' },
            { label: 'Frequent', value: 'frequent' },
            { label: 'Ultra', value: 'ultra' },
          ],
        },
        {
          name: 'enabledTypes',
          type: 'json',
          admin: {
            description: 'Array of enabled spicy card type slugs',
          },
        },
      ],
    },
  ],
};
