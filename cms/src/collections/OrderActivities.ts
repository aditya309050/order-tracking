import type { CollectionConfig } from 'payload';

export const OrderActivities: CollectionConfig = {
  slug: 'order-activities',
  admin: {
    useAsTitle: 'order_number',
    defaultColumns: ['order_number', 'status_to', 'note', 'actor_role', 'created_at'],
    group: 'Operations',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => false, // Ledger is immutable
    delete: ({ req: { user } }) => user?.role === 'OFFICE_ADMIN',
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      label: 'Related Work Order',
    },
    {
      name: 'order_number',
      type: 'text',
      required: true,
      label: 'Order ID Reference',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status_from',
          type: 'text',
          label: 'Previous Status',
        },
        {
          name: 'status_to',
          type: 'text',
          required: true,
          label: 'New Status',
        },
      ],
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Activity / Inspection Note',
    },
    {
      name: 'actor_role',
      type: 'select',
      defaultValue: 'WAREHOUSE',
      options: [
        { label: 'Office Administrator', value: 'OFFICE' },
        { label: 'Warehouse & Shop Floor', value: 'WAREHOUSE' },
        { label: 'Carrier & Logistics', value: 'LOGISTICS' },
      ],
    },
  ],
};
