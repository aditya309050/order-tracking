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

const databaseUri = process.env.DATABASE_URI || process.env.SUPABASE_POSTGRES_URL;

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Orders, OrderActivities, Users],
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
          connectionString: databaseUri,
        },
      })
    : sqliteAdapter({
        client: {
          url: 'file:./local-payload.db',
        },
      }),
});
