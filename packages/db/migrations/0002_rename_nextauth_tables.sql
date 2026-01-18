-- Rename tables to match NextAuth adapter expectations
ALTER TABLE "users" RENAME TO "user";
ALTER TABLE "accounts" RENAME TO "account";
ALTER TABLE "sessions" RENAME TO "session";
ALTER TABLE "verification_token" RENAME TO "verificationToken";
