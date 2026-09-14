import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ClientPortal from '@/components/pages/ClientPortal';

export default function Page() {
  return (
    <ProtectedRoute allowedRoles={['CLIENT']}>
      <ClientPortal />
    </ProtectedRoute>
  );
}
