import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const dbUrl = process.env.LOCAL_DB_PATH || process.env.DATABASE_URL || 'file:local.db'
const authToken = process.env.DATABASE_AUTH_TOKEN

export default {
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: dbUrl,
  },
} satisfies Config
