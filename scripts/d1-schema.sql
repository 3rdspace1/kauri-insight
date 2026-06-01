-- Kauri Insight D1 Schema
-- Apply with: wrangler d1 execute kauri-insight-db --remote --file=scripts/d1-schema.sql

-- Users & Auth
CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "emailVerified" INTEGER,
    "name" TEXT,
    "image" TEXT,
    "created_at" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "account" (
    "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    PRIMARY KEY ("provider", "providerAccountId")
);

CREATE TABLE IF NOT EXISTS "session" (
    "sessionToken" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "expires" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "verificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" INTEGER NOT NULL,
    PRIMARY KEY ("identifier", "token")
);

-- Tenants & Memberships
CREATE TABLE IF NOT EXISTS "tenants" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "industry" TEXT,
    "website" TEXT,
    "description" TEXT,
    "logo" TEXT,
    "primary_color" TEXT DEFAULT '#667eea',
    "context_json" TEXT,
    "created_at" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "memberships" (
    "id" TEXT PRIMARY KEY,
    "tenant_id" TEXT NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "memberships_tenant_idx" ON "memberships"("tenant_id");
CREATE INDEX IF NOT EXISTS "memberships_user_idx" ON "memberships"("user_id");

-- Surveys
CREATE TABLE IF NOT EXISTS "surveys" (
    "id" TEXT PRIMARY KEY,
    "tenant_id" TEXT NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "type" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "language" TEXT NOT NULL DEFAULT 'en',
    "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "surveys_tenant_created_idx" ON "surveys"("tenant_id", "created_at");

-- Questions
CREATE TABLE IF NOT EXISTS "questions" (
    "id" TEXT PRIMARY KEY,
    "survey_id" TEXT NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
    "kind" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "required" INTEGER NOT NULL DEFAULT 1,
    "scale_min" INTEGER,
    "scale_max" INTEGER,
    "scale_min_label" TEXT,
    "scale_max_label" TEXT,
    "choices" TEXT,
    "choices_json" TEXT,
    "prefill" TEXT,
    "logic_json" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "questions_survey_idx" ON "questions"("survey_id");

-- Question Rules
CREATE TABLE IF NOT EXISTS "question_rules" (
    "id" TEXT PRIMARY KEY,
    "survey_id" TEXT NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
    "question_id" TEXT NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
    "rules_json" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "question_rules_survey_question_idx" ON "question_rules"("survey_id", "question_id");

-- Profiles & Consents
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" TEXT PRIMARY KEY,
    "tenant_id" TEXT NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "email" TEXT,
    "name" TEXT,
    "consented" INTEGER DEFAULT 0,
    "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "profiles_tenant_idx" ON "profiles"("tenant_id");

CREATE TABLE IF NOT EXISTS "consents" (
    "id" TEXT PRIMARY KEY,
    "profile_id" TEXT NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "survey_id" TEXT NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
    "consent_given" INTEGER NOT NULL DEFAULT 0,
    "consent_text" TEXT,
    "consented_at" INTEGER NOT NULL,
    "revoked_at" INTEGER
);

-- Responses
CREATE TABLE IF NOT EXISTS "responses" (
    "id" TEXT PRIMARY KEY,
    "survey_id" TEXT NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
    "profile_id" TEXT REFERENCES "profiles"("id") ON DELETE SET NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "completed_at" INTEGER,
    "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "responses_survey_created_idx" ON "responses"("survey_id", "created_at");

CREATE TABLE IF NOT EXISTS "response_items" (
    "id" TEXT PRIMARY KEY,
    "response_id" TEXT NOT NULL REFERENCES "responses"("id") ON DELETE CASCADE,
    "question_id" TEXT NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
    "value_text" TEXT,
    "value_num" INTEGER,
    "value_scale" INTEGER,
    "value_choice" TEXT,
    "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "response_items_response_question_idx" ON "response_items"("response_id", "question_id");

-- Insights
CREATE TABLE IF NOT EXISTS "insights" (
    "id" TEXT PRIMARY KEY,
    "survey_id" TEXT NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sentiment" TEXT,
    "evidence_json" TEXT,
    "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "insights_survey_created_idx" ON "insights"("survey_id", "created_at");

-- Actions
CREATE TABLE IF NOT EXISTS "actions" (
    "id" TEXT PRIMARY KEY,
    "survey_id" TEXT NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "title" TEXT NOT NULL,
    "payload_json" TEXT,
    "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "actions_survey_status_idx" ON "actions"("survey_id", "status");

-- Sources
CREATE TABLE IF NOT EXISTS "sources" (
    "id" TEXT PRIMARY KEY,
    "tenant_id" TEXT NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "kind" TEXT NOT NULL,
    "locator" TEXT NOT NULL,
    "content_json" TEXT,
    "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "sources_tenant_idx" ON "sources"("tenant_id");

-- Invitations
CREATE TABLE IF NOT EXISTS "invitations" (
    "id" TEXT PRIMARY KEY,
    "tenant_id" TEXT NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "invitations_tenant_idx" ON "invitations"("tenant_id");
CREATE INDEX IF NOT EXISTS "invitations_email_idx" ON "invitations"("email");

-- Reports
CREATE TABLE IF NOT EXISTS "reports" (
    "id" TEXT PRIMARY KEY,
    "survey_id" TEXT NOT NULL REFERENCES "surveys"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "executive_summary" TEXT,
    "sections_json" TEXT,
    "created_at" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "reports_survey_idx" ON "reports"("survey_id");

CREATE TABLE IF NOT EXISTS "report_sections" (
    "id" TEXT PRIMARY KEY,
    "report_id" TEXT NOT NULL REFERENCES "reports"("id") ON DELETE CASCADE,
    "heading" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metrics_json" TEXT,
    "chart_refs" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" INTEGER NOT NULL
);
