import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import OfficeAdmin from '@/components/pages/OfficeAdmin';

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['OFFICE_ADMIN']}>
      <OfficeAdmin />
    </ProtectedRoute>
  );
}
