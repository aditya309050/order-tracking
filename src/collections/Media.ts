import type { CollectionConfig } from 'payload';

/**
 * Media / file uploads. Files are stored in Vercel Blob (see payload.config.ts
 * plugins). Use this to attach product photos, artwork proofs, or delivery
 * evidence to orders.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Operations',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'OFFICE_ADMIN',
  },
  upload: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt text / caption',
    },
  ],
};
