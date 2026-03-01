export const runtime = 'edge'

import NextAuth from 'next-auth'
import Nodemailer from 'next-auth/providers/nodemailer'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@kauri/db/client'
import { users } from '@kauri/db/schema'
import { eq } from 'drizzle-orm'
import { sendEmail, createMagicLinkEmail } from '@kauri/integrations/email'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db) as any,
  providers: [
    Nodemailer({
      server: process.env.SMTP_HOST
        ? {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        }
        : {
          host: 'localhost',
          port: 1025,
          auth: {
            user: 'test',
            pass: 'test',
          },
        },
      from: process.env.NEXTAUTH_EMAIL_FROM || 'noreply@kauri-insight.app',
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await sendEmail(createMagicLinkEmail(email, url))
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      // Find or create user
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
            createdAt: Date.now(),
          } as any)
          .returning()

        existingUser = newUser
      }

      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub

        // Get user's tenant memberships
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
          // Add first tenant to session (or implement tenant switching later)
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

