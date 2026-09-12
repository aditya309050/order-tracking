import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'CLIENT',
      options: [
        { label: 'Office Administrator', value: 'OFFICE_ADMIN' },
        { label: 'Warehouse & Shop Floor', value: 'WAREHOUSE_ADMIN' },
        { label: 'Client / Customer', value: 'CLIENT' },
      ],
    },
    {
      name: 'client_access_id',
      type: 'text',
      admin: {
        description: 'For client accounts, matches their order tracking portal ID',
      },
    },
  ],
};
