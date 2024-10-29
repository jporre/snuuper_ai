import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import {db} from "$lib/server/db/pgcon";
import {authUser, userSession} from "$lib/server/db/schema";
import { Lucia, TimeSpan } from "lucia";
import { dev } from "$app/environment";
import { env } from '$env/dynamic/private';
import { Google } from "arctic";
import { adapter } from "$lib/server/db//mongodb";
import type { ObjectId } from "mongodb";

//const adapter = new DrizzlePostgreSQLAdapter(db, userSession, authUser);

export const lucia = new Lucia(adapter, {
	sessionExpiresIn: new TimeSpan(10, "d"),
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev
		}
	},getUserAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseUserAttributes
			email: attributes.email,
			personalData: {
				firstname: attributes.personalData.firstname,
				lastname: attributes.personalData.lastname,
				secondlastname: attributes.personalData.secondlastname,
				gender: attributes.personalData.gender,
				cellphone: attributes.personalData.cellphone,
			},
			accountData: {
				status: attributes.accountData.status,
				role: attributes.accountData.role,
				companyId: attributes.accountData.companyId,
				isCompanyAdmin: attributes.accountData.isCompanyAdmin,
				picture: attributes.accountData.picture
			}
		};
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		UserId: ObjectId;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface OtrosDatosUsuario {
	empresa: number;
	perfil: string;
	codigo_perfil: string;
}

interface DatabaseUserAttributes {
	email: string;
	personalData: {
        firstname: string | '';
        lastname: string | '';
        secondlastname: string | '';
        gender: string | '';
        cellphone: string | '';
    },
	accountData: {
		status: string | 'pending';
		role: string | 'user';
		companyId: ObjectId | null;
		isCompanyAdmin: boolean;
		picture: string | '';
	};
}

const googleRedirectUrl = dev
	? 'http://localhost:5173/login/google/callback'
	: env.GOOGLE_REDIRECT_URI;

export const google = new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, googleRedirectUrl);