export const runtime = 'edge'

import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/lib/db'
import { users } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { sendEmail, createMagicLinkEmail } from '@kauri/integrations/email'

// Edge-compatible email provider — uses our Resend-backed sendEmail helper
// instead of nodemailer (which requires Node.js runtime).
const emailProvider = {
  id: 'resend',
  type: 'email' as const,
  name: 'Email',
  from: process.env.NEXTAUTH_EMAIL_FROM || 'noreply@kauri-insight.app',
  maxAge: 24 * 60 * 60,
  sendVerificationRequest: async ({
    identifier: email,
    url,
  }: {
    identifier: string
    url: string
  }) => {
    await sendEmail(createMagicLinkEmail(email, url))
  },
  options: {},
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db) as any,
  providers: [emailProvider as any],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      let existingUser = await db.query.users.findFirst({
        where: eq(users.email, user.email),
      })

      if (!existingUser) {
        const [newUser] = await db
          .insert(users)
          .values({
            id: crypto.randomUUID(),
            email: user.email,
            name: user.name || null,
            createdAt: new Date(),
          } as any)
          .returning()

        existingUser = newUser
      }

      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub

        const userRecord = await db.query.users.findFirst({
          where: eq(users.email, session.user.email!),
          with: {
            memberships: {
              with: {
                tenant: true,
              },
            },
          },
        }) as any

        if (userRecord && userRecord.memberships?.length > 0) {
          const membership = userRecord.memberships[0]
          session.tenantId = membership.tenant.id
          session.role = membership.role
        }
      }

      return session
    },
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/verify-request',
  },
  session: {
    strategy: 'jwt',
  },
})

declare module 'next-auth' {
  interface Session {
    tenantId?: string
    role?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
  }
}
