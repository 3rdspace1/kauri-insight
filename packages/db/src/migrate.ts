import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const dbUrl = process.env.LOCAL_DB_PATH || process.env.DATABASE_URL || 'file:local.db'
const authToken = process.env.DATABASE_AUTH_TOKEN

async function runMigrations() {
  console.log('⏳ Running migrations on:', dbUrl)

  const client = createClient({
    url: dbUrl,
    authToken: authToken,
  })

  const db = drizzle(client)

  await migrate(db, { migrationsFolder: './migrations' })

  console.log('✅ Migrations completed')
  process.exit(0)
}

runMigrations().catch((error) => {
  console.error('❌ Migration failed')
  console.error(error)
  process.exit(1)
})
