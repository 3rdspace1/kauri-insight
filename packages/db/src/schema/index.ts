import { pgTable, text, uuid, timestamp, varchar, jsonb, integer, boolean, index, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// NextAuth adapter tables
export const accounts = pgTable('accounts', {
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
}, (table) => ({
  compoundKey: primaryKey({ columns: [table.provider, table.providerAccountId] }),
}))

export const sessions = pgTable('sessions', {
  sessionToken: varchar('sessionToken', { length: 255 }).notNull().primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
})

export const verificationTokens = pgTable('verification_token', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  compoundKey: primaryKey({ columns: [table.identifier, table.token] }),
}))

// Users and Tenants
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('emailVerified'),
  name: varchar('name', { length: 255 }),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull().default('viewer'), // owner, staff, viewer
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index('memberships_tenant_idx').on(table.tenantId),
  userIdx: index('memberships_user_idx').on(table.userId),
}))

// Surveys
export const surveys = pgTable('surveys', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'), // draft, active, paused, archived
  type: varchar('type', { length: 100 }), // appointment_follow_up, pulse_check, post_emergency
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tenantCreatedIdx: index('surveys_tenant_created_idx').on(table.tenantId, table.createdAt),
}))

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  surveyId: uuid('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  kind: varchar('kind', { length: 50 }).notNull(), // scale, text, choice
  text: text('text').notNull(),
  scaleMin: integer('scale_min'),
  scaleMax: integer('scale_max'),
  choicesJson: jsonb('choices_json'), // Array of choice options
  prefill: text('prefill'), // AI-suggested question context
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  surveyIdx: index('questions_survey_idx').on(table.surveyId),
}))

export const questionRules = pgTable('question_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  surveyId: uuid('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  rulesJson: jsonb('rules_json').notNull(), // { trigger: {}, probe: '', action: '' }
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  surveyQuestionIdx: index('question_rules_survey_question_idx').on(table.surveyId, table.questionId),
}))

// Profiles and Consents
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
  consented: boolean('consented').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index('profiles_tenant_idx').on(table.tenantId),
}))

export const consents = pgTable('consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  scope: varchar('scope', { length: 100 }).notNull(), // survey_response, marketing, etc
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
})

// Responses
export const responses = pgTable('responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  surveyId: uuid('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'set null' }),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  surveyCreatedIdx: index('responses_survey_created_idx').on(table.surveyId, table.createdAt),
}))

export const responseItems = pgTable('response_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  responseId: uuid('response_id').notNull().references(() => responses.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  valueText: text('value_text'),
  valueNum: integer('value_num'),
  valueChoice: varchar('value_choice', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  responseQuestionIdx: index('response_items_response_question_idx').on(table.responseId, table.questionId),
}))

// Insights
export const insights = pgTable('insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  surveyId: uuid('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary').notNull(),
  sentiment: varchar('sentiment', { length: 50 }), // positive, neutral, negative
  evidenceJson: jsonb('evidence_json'), // Array of evidence snippets with response IDs
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  surveyCreatedIdx: index('insights_survey_created_idx').on(table.surveyId, table.createdAt),
}))

// Actions
export const actions = pgTable('actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  surveyId: uuid('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  kind: varchar('kind', { length: 100 }).notNull(), // alert, follow_up, review
  status: varchar('status', { length: 50 }).notNull().default('open'), // open, doing, done
  title: varchar('title', { length: 255 }).notNull(),
  payloadJson: jsonb('payload_json'), // Additional context
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  surveyStatusIdx: index('actions_survey_status_idx').on(table.surveyId, table.status),
}))

// Sources
export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  kind: varchar('kind', { length: 100 }).notNull(), // website, csv, manual
  locator: text('locator').notNull(), // URL or file reference
  contentJson: jsonb('content_json'), // Parsed content
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index('sources_tenant_idx').on(table.tenantId),
}))

// Reports
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  surveyId: uuid('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  executiveSummary: text('executive_summary'),
  sectionsJson: jsonb('sections_json'), // Array of report sections
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  surveyIdx: index('reports_survey_idx').on(table.surveyId),
}))

export const reportSections = pgTable('report_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  heading: varchar('heading', { length: 255 }).notNull(),
  body: text('body').notNull(),
  metricsJson: jsonb('metrics_json'),
  chartRefs: jsonb('chart_refs'), // References to chart specs
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
}))

export const tenantsRelations = relations(tenants, ({ many }) => ({
  memberships: many(memberships),
  surveys: many(surveys),
  profiles: many(profiles),
  sources: many(sources),
}))

export const membershipsRelations = relations(memberships, ({ one }) => ({
  tenant: one(tenants, {
    fields: [memberships.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
}))

export const surveysRelations = relations(surveys, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [surveys.tenantId],
    references: [tenants.id],
  }),
  questions: many(questions),
  questionRules: many(questionRules),
  responses: many(responses),
  insights: many(insights),
  actions: many(actions),
  reports: many(reports),
}))

export const questionsRelations = relations(questions, ({ one, many }) => ({
  survey: one(surveys, {
    fields: [questions.surveyId],
    references: [surveys.id],
  }),
  rules: many(questionRules),
  responseItems: many(responseItems),
}))

export const questionRulesRelations = relations(questionRules, ({ one }) => ({
  survey: one(surveys, {
    fields: [questionRules.surveyId],
    references: [surveys.id],
  }),
  question: one(questions, {
    fields: [questionRules.questionId],
    references: [questions.id],
  }),
}))

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [profiles.tenantId],
    references: [tenants.id],
  }),
  consents: many(consents),
  responses: many(responses),
}))

export const responsesRelations = relations(responses, ({ one, many }) => ({
  survey: one(surveys, {
    fields: [responses.surveyId],
    references: [surveys.id],
  }),
  profile: one(profiles, {
    fields: [responses.profileId],
    references: [profiles.id],
  }),
  items: many(responseItems),
}))

export const responseItemsRelations = relations(responseItems, ({ one }) => ({
  response: one(responses, {
    fields: [responseItems.responseId],
    references: [responses.id],
  }),
  question: one(questions, {
    fields: [responseItems.questionId],
    references: [questions.id],
  }),
}))
