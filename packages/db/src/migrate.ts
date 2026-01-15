import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

async function runMigrations() {
  console.log('⏳ Running migrations...')

  const client = postgres(connectionString!, { max: 1 })
  const db = drizzle(client)

  await migrate(db, { migrationsFolder: './migrations' })

  console.log('✅ Migrations completed')
  await client.end()
  process.exit(0)
}

runMigrations().catch((error) => {
  console.error('❌ Migration failed')
  console.error(error)
  process.exit(1)
})
