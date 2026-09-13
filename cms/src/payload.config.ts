// Allow Supabase SSL certificate chain in Node.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { Orders } from './collections/Orders';
import { OrderActivities } from './collections/OrderActivities';
import { Users } from './collections/Users';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseUri =
  process.env.DATABASE_URI ||
  process.env.SUPABASE_POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Orders, OrderActivities, Users],
  cors: ['http://localhost:3000', 'https://*.vercel.app'],
  csrf: ['http://localhost:3000', 'https://*.vercel.app'],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'payload-manufacturing-secret-vanguard-ops-2026',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Automatically use Postgres when DATABASE_URI (Supabase) is provided,
  // or fall back to local SQLite file for local instant testing:
  db: databaseUri
    ? postgresAdapter({
        pool: {
          connectionString: databaseUri.replace('?sslmode=require', '').replace('&sslmode=require', ''),
          ssl: {
            rejectUnauthorized: false,
          },
        },
        push: false,
        tablesFilter: ['orders*', 'order_activities*', 'users*', 'payload_*'],
      })
    : sqliteAdapter({
        client: {
          url: 'file:./local-payload.db',
        },
      }),
});
