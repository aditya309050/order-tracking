import type { CollectionConfig } from 'payload';

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'order_number',
    defaultColumns: ['order_number', 'client_name', 'product', 'quantity', 'status', 'priority', 'created_at'],
    group: 'Operations',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req: { user } }) => user?.role === 'OFFICE_ADMIN',
  },
  fields: [
    {
      name: 'order_number',
      type: 'text',
      required: true,
      unique: true,
      label: 'Order ID (e.g. ORD-1025)',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'client_name',
          type: 'text',
          required: true,
          label: 'Client Company Name',
        },
        {
          name: 'client_phone',
          type: 'text',
          required: true,
          label: 'Client Contact Phone',
        },
        {
          name: 'client_email',
          type: 'email',
          label: 'Client Email',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'client_access_id',
          type: 'text',
          label: 'Client Portal Login ID',
          admin: {
            description: 'Unique ID provided to client to track this order at /client',
          },
        },
        {
          name: 'client_password',
          type: 'text',
          label: 'Client Portal Password',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'product',
          type: 'text',
          required: true,
          label: 'Product / Fabrication Spec',
        },
        {
          name: 'category',
          type: 'select',
          defaultValue: 'Hoardings',
          options: [
            { label: 'Hoardings & Banners', value: 'Hoardings' },
            { label: 'Signage & 3D Letters', value: 'Signage' },
            { label: 'Displays & Wayfinding', value: 'Displays' },
            { label: 'Vehicular Graphics', value: 'Fleet' },
            { label: 'Custom Fabrication', value: 'Custom' },
          ],
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          defaultValue: 1,
          label: 'Quantity',
        },
        {
          name: 'dimensions',
          type: 'text',
          label: 'Dimensions (e.g. 20ft x 10ft)',
        },
      ],
    },
    {
      name: 'design_notes',
      type: 'textarea',
      label: 'Design & Engineering Notes',
    },
    {
      name: 'delivery_address',
      type: 'textarea',
      required: true,
      label: 'Installation / Delivery Address',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'CONFIRMED',
          options: [
            { label: '1. Order Confirmed', value: 'CONFIRMED' },
            { label: '2. In Process (Fabrication)', value: 'IN_PROCESS' },
            { label: '3. Completed (QC Passed)', value: 'COMPLETED' },
            { label: '4. Packed & Staged', value: 'PACKED' },
            { label: '5. Out for Delivery', value: 'OUT_FOR_DELIVERY' },
            { label: '6. Delivered & Fulfilled', value: 'DELIVERED' },
          ],
        },
        {
          name: 'priority',
          type: 'select',
          defaultValue: 'NORMAL',
          options: [
            { label: 'Normal', value: 'NORMAL' },
            { label: 'High Priority', value: 'HIGH' },
            { label: 'Urgent', value: 'URGENT' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'assigned_to',
          type: 'text',
          label: 'Assigned Shop Floor Bay / Technician',
        },
        {
          name: 'delivery_driver',
          type: 'text',
          label: 'Assigned Carrier / Driver',
        },
        {
          name: 'driver_phone',
          type: 'text',
          label: 'Carrier Contact Phone',
        },
        {
          name: 'tracking_number',
          type: 'text',
          label: 'Waybill / Dispatch Tracking Code',
        },
        {
          name: 'estimated_delivery',
          type: 'text',
          label: 'Estimated Delivery Date',
        },
      ],
    },
  ],
};
