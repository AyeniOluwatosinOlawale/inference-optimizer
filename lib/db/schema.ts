import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  numeric,
  json,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const providerKeys = pgTable(
  'provider_keys',
  {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id),
    provider: varchar('provider', { length: 50 }).notNull(),
    keyHint: varchar('key_hint', { length: 20 }).notNull(),
    keyEnc: text('key_enc').notNull(),
    baseUrl: text('base_url'),
    name: varchar('name', { length: 100 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [unique().on(t.teamId, t.provider)]
);

export const gatewayRequests = pgTable('gateway_requests', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id),
  provider: varchar('provider', { length: 50 }).notNull().default('anthropic'),
  modelRequested: varchar('model_requested', { length: 100 }).notNull(),
  modelUsed: varchar('model_used', { length: 100 }).notNull(),
  modelBaseline: varchar('model_baseline', { length: 100 }).notNull(),
  inputTokens: integer('input_tokens').notNull().default(0),
  outputTokens: integer('output_tokens').notNull().default(0),
  cacheReadTokens: integer('cache_read_tokens').notNull().default(0),
  costUsd: numeric('cost_usd', { precision: 12, scale: 6 }).notNull().default('0'),
  baselineCostUsd: numeric('baseline_cost_usd', { precision: 12, scale: 6 }).notNull().default('0'),
  savingsUsd: numeric('savings_usd', { precision: 12, scale: 6 }).notNull().default('0'),
  ttftMs: integer('ttft_ms'),
  totalMs: integer('total_ms'),
  fromCache: boolean('from_cache').notNull().default(false),
  usedFallback: boolean('used_fallback').notNull().default(false),
  optimizations: json('optimizations').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const gatewayApiKeys = pgTable('gateway_api_keys', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  keyHash: varchar('key_hash', { length: 64 }).notNull().unique(),
  keyPrefix: varchar('key_prefix', { length: 10 }).notNull(),
  name: varchar('name', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  revokedAt: timestamp('revoked_at'),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  providerKeys: many(providerKeys),
  gatewayRequests: many(gatewayRequests),
  gatewayApiKeys: many(gatewayApiKeys),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const providerKeysRelations = relations(providerKeys, ({ one }) => ({
  team: one(teams, { fields: [providerKeys.teamId], references: [teams.id] }),
}));

export const gatewayRequestsRelations = relations(gatewayRequests, ({ one }) => ({
  team: one(teams, { fields: [gatewayRequests.teamId], references: [teams.id] }),
}));

export const gatewayApiKeysRelations = relations(gatewayApiKeys, ({ one }) => ({
  team: one(teams, { fields: [gatewayApiKeys.teamId], references: [teams.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export type ProviderKey = typeof providerKeys.$inferSelect;
export type NewProviderKey = typeof providerKeys.$inferInsert;
export type GatewayRequest = typeof gatewayRequests.$inferSelect;
export type NewGatewayRequest = typeof gatewayRequests.$inferInsert;
export type GatewayApiKey = typeof gatewayApiKeys.$inferSelect;
export type NewGatewayApiKey = typeof gatewayApiKeys.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
