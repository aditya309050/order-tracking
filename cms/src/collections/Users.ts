import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
    defaultColumns: ['email', 'role', 'createdAt'],
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data) {
          if (!data.name && data.email) {
            data.name = data.email.split('@')[0];
          }
          if (!data.role) {
            data.role = 'OFFICE_ADMIN';
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'OFFICE_ADMIN',
      options: [
        { label: 'Office Administrator', value: 'OFFICE_ADMIN' },
        { label: 'Warehouse & Shop Floor', value: 'WAREHOUSE_ADMIN' },
      ],
      admin: {
        hidden: true,
      },
    },
  ],
};
