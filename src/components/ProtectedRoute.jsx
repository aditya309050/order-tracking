'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const roleAllowed =
    !allowedRoles || allowedRoles.length === 0 || (user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      const params = new URLSearchParams({ from: pathname || '/' });
      router.replace(`/login?${params.toString()}`);
      return;
    }

    if (!roleAllowed) {
      if (user?.role === 'CLIENT') router.replace('/client');
      else if (user?.role === 'WAREHOUSE_ADMIN') router.replace('/warehouseadmin');
      else if (user?.role === 'OFFICE_ADMIN') router.replace('/officeadmin');
      else router.replace('/');
    }
  }, [loading, isAuthenticated, roleAllowed, user, router, pathname]);

  if (loading || !isAuthenticated || !roleAllowed) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}
