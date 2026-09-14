import React from 'react';
import ClientTrack from '@/components/pages/ClientTrack';

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <ClientTrack orderId={decodeURIComponent(orderId)} />;
}
