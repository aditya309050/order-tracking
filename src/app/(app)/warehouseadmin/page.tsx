import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import WarehouseAdmin from '@/components/pages/WarehouseAdmin';

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['WAREHOUSE_ADMIN', 'OFFICE_ADMIN']}>
      <WarehouseAdmin />
    </ProtectedRoute>
  );
}
