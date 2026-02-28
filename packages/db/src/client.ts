import { drizzle } from 'drizzle-orm/d1'
import type { D1Database } from '@cloudflare/workers-types'
import * as schema from './schema'

// In Cloudflare Pages Edge Runtime, bindings are injected into `process.env`.
// We use a Proxy to lazily access `process.env.DB` on each database operation,
// avoiding the need to pass `db` manually through every stack frame.

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema })
}

export type Database = ReturnType<typeof createDb>
export * as schema from './schema'

// Base dummy to satisfy Drizzle adapter's `is(db, ...)` checks during build and init
const dummyDb = createDb({} as unknown as D1Database);

// Global db proxy for edge runtime
export const db = new Proxy(dummyDb as Database, {
  get(target, prop) {
    if (typeof process === 'undefined' || !process.env.DB) {
      if (prop === 'then') return undefined; // Avoid Promise resolution issues
      // Fallback to the dummy to prevent immediate crashes, or return undefined gracefully
      const value = (target as any)[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    }
    const instance = createDb(process.env.DB as unknown as D1Database);
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
  getPrototypeOf(target) {
    if (typeof process !== 'undefined' && process.env.DB) {
      const instance = createDb(process.env.DB as unknown as D1Database);
      return Object.getPrototypeOf(instance);
    }
    return Object.getPrototypeOf(target);
  }
})
