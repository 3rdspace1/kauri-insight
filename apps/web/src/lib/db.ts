import { getRequestContext } from '@cloudflare/next-on-pages'
import { createDb, type Database } from '@kauri/db/client'

export { schema } from '@kauri/db/client'

// A real drizzle instance backed by an empty object — used as the proxy target
// so that DrizzleAdapter's `instanceof` checks pass at module-init time (before
// any request context is available).
const dummyDb = createDb({} as any)

/**
 * Lazy proxy — resolves the live D1 binding from the Cloudflare request context
 * on every property access so it works correctly inside edge route handlers,
 * while still satisfying prototype checks (instanceof BaseSQLiteDatabase) that
 * libraries like @auth/drizzle-adapter run at startup.
 */
export const db = new Proxy(dummyDb as Database, {
  get(target, prop) {
    if (prop === 'then') return undefined
    try {
      const ctx = getRequestContext()
      if ((ctx.env as any)?.DB) {
        const instance = createDb((ctx.env as any).DB)
        const value = (instance as any)[prop]
        return typeof value === 'function' ? value.bind(instance) : value
      }
    } catch {
      // No request context (module init / build time) — fall through to dummy
    }
    const value = (target as any)[prop]
    return typeof value === 'function' ? value.bind(target) : value
  },
})
