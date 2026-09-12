'use server';

import { authenticateClient, clearClientSession } from '@/lib/clientAuth';
import { redirect } from 'next/navigation';

export async function handleClientLogin(prevState: any, formData: FormData) {
  const clientId = formData.get('clientId')?.toString() || '';
  const password = formData.get('password')?.toString() || '';

  const result = await authenticateClient(clientId, password);

  if (!result.success) {
    return { error: result.error || 'Authentication failed' };
  }

  // Successfully authenticated -> redirect to portal
  redirect('/portal');
}

export async function handleClientLogout() {
  await clearClientSession();
  redirect('/login');
}
