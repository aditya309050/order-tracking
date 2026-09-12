import config from '@payload-config';
import '@payloadcms/next/css';
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts';
import React from 'react';
import { importMap } from './admin/importMap';

type Args = {
  children: React.ReactNode;
};

const serverFunction = async function (args: any) {
  'use server';
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export default async function Layout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
