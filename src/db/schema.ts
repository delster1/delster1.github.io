import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  uuid,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Users
 * - Keep it minimal at first.
 * - Add profile fields later (image, username, etc.)
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    name: text("name"),
    emailVerified: boolean("email_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
  })
);

/**
 * Sessions
 * - Store a session token (or id) that maps to a user.
 * - You can also store an ip/userAgent for auditing.
 */
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Typically a random token stored in cookie (hashed if you want extra safety)
    sessionToken: varchar("session_token", { length: 255 }).notNull(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    ip: varchar("ip", { length: 45 }), // IPv4/IPv6
    userAgent: text("user_agent"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tokenUnique: uniqueIndex("sessions_token_unique").on(t.sessionToken),
    userIdx: index("sessions_user_id_idx").on(t.userId),
  })
);

/**
 * Accounts (OAuth / external identity)
 * - One user can have many accounts (github/google/etc).
 */
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // e.g. "github", "google"
    provider: varchar("provider", { length: 50 }).notNull(),

    // provider's unique id for the user (github user id, google sub, etc.)
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),

    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: integer("expires_at"), // seconds since epoch is common
    tokenType: varchar("token_type", { length: 50 }),
    scope: text("scope"),
    idToken: text("id_token"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    providerUnique: uniqueIndex("accounts_provider_unique").on(
      t.provider,
      t.providerAccountId
    ),
    userIdx: index("accounts_user_id_idx").on(t.userId),
  })
);

/**
 * Verification tokens (email verify / password reset / magic link)
 * - token is usually random and stored hashed (optional at this stage).
 */
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // email or user id depending on flow
    identifier: varchar("identifier", { length: 320 }).notNull(),

    token: varchar("token", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // "email_verify" | "password_reset" | etc.

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    tokenUnique: uniqueIndex("verification_tokens_token_unique").on(t.token),
    identifierIdx: index("verification_tokens_identifier_idx").on(t.identifier),
  })
);

