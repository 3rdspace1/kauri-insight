import { sqliteTable, text, integer, primaryKey, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Users and Tenants
export const users = sqliteTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp' }),
  name: text('name'),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const accounts = sqliteTable('account', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table: any) => ({
  compoundKey: primaryKey({ columns: [table.provider, table.providerAccountId] }),
}))

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
})

export const verificationTokens = sqliteTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  compoundKey: primaryKey({ columns: [table.identifier, table.token] }),
}))

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  industry: text('industry'),
  website: text('website'),
  description: text('description'),
  logo: text('logo'),
  primaryColor: text('primary_color').default('#667eea'),
  contextJson: text('context_json', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const memberships = sqliteTable('memberships', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('viewer'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  tenantIdx: index('memberships_tenant_idx').on(table.tenantId),
  userIdx: index('memberships_user_idx').on(table.userId),
}))

export const surveys = sqliteTable('surveys', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('draft'),
  type: text('type'),
  version: integer('version').notNull().default(1),
  language: text('language').notNull().default('en'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  tenantCreatedIdx: index('surveys_tenant_created_idx').on(table.tenantId, table.createdAt),
}))

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  surveyId: text('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  text: text('text').notNull(),
  type: text('type').notNull().default('text'),
  required: integer('required', { mode: 'boolean' }).notNull().default(true),
  scaleMin: integer('scale_min'),
  scaleMax: integer('scale_max'),
  scaleMinLabel: text('scale_min_label'),
  scaleMaxLabel: text('scale_max_label'),
  choices: text('choices', { mode: 'json' }),
  choicesJson: text('choices_json', { mode: 'json' }),
  prefill: text('prefill'),
  logicJson: text('logic_json', { mode: 'json' }),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  surveyIdx: index('questions_survey_idx').on(table.surveyId),
}))

export const questionRules = sqliteTable('question_rules', {
  id: text('id').primaryKey(),
  surveyId: text('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  rulesJson: text('rules_json', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  surveyQuestionIdx: index('question_rules_survey_question_idx').on(table.surveyId, table.questionId),
}))

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  email: text('email'),
  name: text('name'),
  consented: integer('consented', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  tenantIdx: index('profiles_tenant_idx').on(table.tenantId),
}))

export const consents = sqliteTable('consents', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  surveyId: text('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  consentGiven: integer('consent_given', { mode: 'boolean' }).notNull().default(false),
  consentText: text('consent_text'),
  consentedAt: integer('consented_at', { mode: 'timestamp' }).notNull(),
  revokedAt: integer('revoked_at', { mode: 'timestamp' }),
})

export const responses = sqliteTable('responses', {
  id: text('id').primaryKey(),
  surveyId: text('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  profileId: text('profile_id').references(() => profiles.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('in_progress'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  surveyCreatedIdx: index('responses_survey_created_idx').on(table.surveyId, table.createdAt),
}))

export const responseItems = sqliteTable('response_items', {
  id: text('id').primaryKey(),
  responseId: text('response_id').notNull().references(() => responses.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  valueText: text('value_text'),
  valueNum: integer('value_num'),
  valueScale: integer('value_scale'),
  valueChoice: text('value_choice'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  responseQuestionIdx: index('response_items_response_question_idx').on(table.responseId, table.questionId),
}))

export const insights = sqliteTable('insights', {
  id: text('id').primaryKey(),
  surveyId: text('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  sentiment: text('sentiment'),
  evidenceJson: text('evidence_json', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  surveyCreatedIdx: index('insights_survey_created_idx').on(table.surveyId, table.createdAt),
}))

export const actions = sqliteTable('actions', {
  id: text('id').primaryKey(),
  surveyId: text('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  status: text('status').notNull().default('open'),
  title: text('title').notNull(),
  payloadJson: text('payload_json', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  surveyStatusIdx: index('actions_survey_status_idx').on(table.surveyId, table.status),
}))

export const sources = sqliteTable('sources', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  locator: text('locator').notNull(),
  contentJson: text('content_json', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  tenantIdx: index('sources_tenant_idx').on(table.tenantId),
}))

export const invitations = sqliteTable('invitations', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull().default('viewer'),
  status: text('status').notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  tenantIdx: index('invitations_tenant_idx').on(table.tenantId),
  emailIdx: index('invitations_email_idx').on(table.email),
}))

export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  surveyId: text('survey_id').notNull().references(() => surveys.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  executiveSummary: text('executive_summary'),
  sectionsJson: text('sections_json', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table: any) => ({
  surveyIdx: index('reports_survey_idx').on(table.surveyId),
}))

export const reportSections = sqliteTable('report_sections', {
  id: text('id').primaryKey(),
  reportId: text('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  heading: text('heading').notNull(),
  body: text('body').notNull(),
  metricsJson: text('metrics_json', { mode: 'json' }),
  chartRefs: text('chart_refs', { mode: 'json' }),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }: any) => ({
  memberships: many(memberships),
}))

export const tenantsRelations = relations(tenants, ({ many }: any) => ({
  memberships: many(memberships),
  surveys: many(surveys),
  profiles: many(profiles),
  sources: many(sources),
}))

export const membershipsRelations = relations(memberships, ({ one }: any) => ({
  tenant: one(tenants, {
    fields: [memberships.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
}))

export const surveysRelations = relations(surveys, ({ one, many }: any) => ({
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

export const questionsRelations = relations(questions, ({ one, many }: any) => ({
  survey: one(surveys, {
    fields: [questions.surveyId],
    references: [surveys.id],
  }),
  rules: many(questionRules),
  responseItems: many(responseItems),
}))

export const questionRulesRelations = relations(questionRules, ({ one }: any) => ({
  survey: one(surveys, {
    fields: [questionRules.surveyId],
    references: [surveys.id],
  }),
  question: one(questions, {
    fields: [questionRules.questionId],
    references: [questions.id],
  }),
}))

export const profilesRelations = relations(profiles, ({ one, many }: any) => ({
  tenant: one(tenants, {
    fields: [profiles.tenantId],
    references: [tenants.id],
  }),
  consents: many(consents),
  responses: many(responses),
}))

export const responsesRelations = relations(responses, ({ one, many }: any) => ({
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

export const responseItemsRelations = relations(responseItems, ({ one }: any) => ({
  response: one(responses, {
    fields: [responseItems.responseId],
    references: [responses.id],
  }),
  question: one(questions, {
    fields: [responseItems.questionId],
    references: [questions.id],
  }),
}))

export const insightsRelations = relations(insights, ({ one }: any) => ({
  survey: one(surveys, {
    fields: [insights.surveyId],
    references: [surveys.id],
  }),
}))

export const actionsRelations = relations(actions, ({ one }: any) => ({
  survey: one(surveys, {
    fields: [actions.surveyId],
    references: [surveys.id],
  }),
}))

export const sourcesRelations = relations(sources, ({ one }: any) => ({
  tenant: one(tenants, {
    fields: [sources.tenantId],
    references: [tenants.id],
  }),
}))

export const reportsRelations = relations(reports, ({ one, many }: any) => ({
  survey: one(surveys, {
    fields: [reports.surveyId],
    references: [surveys.id],
  }),
  sections: many(reportSections),
}))

export const reportSectionsRelations = relations(reportSections, ({ one }: any) => ({
  report: one(reports, {
    fields: [reportSections.reportId],
    references: [reports.id],
  }),
}))

export const invitationsRelations = relations(invitations, ({ one }: any) => ({
  tenant: one(tenants, {
    fields: [invitations.tenantId],
    references: [tenants.id],
  }),
}))
