import { relations } from "drizzle-orm/relations";
import { authUser, oauthAccount } from "./schema";

export const oauthAccountRelations = relations(oauthAccount, ({one}) => ({
	authUser: one(authUser, {
		fields: [oauthAccount.userId],
		references: [authUser.id]
	}),
}));

export const authUserRelations = relations(authUser, ({many}) => ({
	oauthAccounts: many(oauthAccount),
}));