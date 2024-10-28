import { pgTable, check, integer, varchar, text, timestamp, serial, unique, jsonb, date, boolean, uuid, foreignKey, primaryKey, pgView, bigint, inet, doublePrecision, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const userSession = pgTable("user_session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'date' }).notNull(),
	userId: text("user_id").notNull(),
});

export const authUser = pgTable("auth_user", {
	id: text().primaryKey().notNull(),
	username: varchar({ length: 90 }).notNull(),
	email: varchar({ length: 120 }).notNull(),
	nombre: varchar({ length: 250 }).notNull(),
	fono: varchar({ length: 120 }),
	passwordHash: varchar("password_hash", { length: 120 }),
	activo: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	otros: jsonb(),
	foto: varchar(),
	dob: date(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	idn: serial().notNull(),
	idLargo: uuid("id_largo").default(sql`uuid_generate_v4()`).notNull(),
},
(table) => {
	return {
		authUserUniqueMail: unique("auth_user_unique_mail").on(table.email),
	}
});

export const oauthAccount = pgTable("oauth_account", {
	providerId: text("provider_id").notNull(),
	providerUserId: text("provider_user_id").notNull(),
	userId: text("user_id").notNull(),
},
(table) => {
	return {
		oauthAccountUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [authUser.id],
			name: "oauth_account_user_id_fkey"
		}),
		oauthAccountPkey: primaryKey({ columns: [table.providerId, table.providerUserId], name: "oauth_account_pkey"}),
	}
});

export const test = pgTable("test", {
	id: serial().primaryKey().notNull(),
});