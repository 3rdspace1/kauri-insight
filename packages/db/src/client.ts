import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

// During build time (NODE_ENV=production without DATABASE_URL), use a dummy connection
// This allows TypeScript to infer types correctly without actually connecting
const isBuildTime = process.env.NODE_ENV === 'production' && !connectionString

let client: ReturnType<typeof postgres>

if (isBuildTime) {
  // Create a stub connection that won't actually be used during build
  client = postgres('postgresql://localhost:5432/dummy', {
    max: 0, // No actual connections
  })
} else {
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // For serverless environments, use a connection pool
  client = postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

export const db = drizzle(client, { schema })
export type Database = typeof db
