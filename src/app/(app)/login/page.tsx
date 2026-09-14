'use client';

import React, { Suspense } from 'react';
import LoginView from '@/components/pages/LoginView';

function Loader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <LoginView />
    </Suspense>
  );
}
