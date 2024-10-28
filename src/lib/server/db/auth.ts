import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import {db} from "$lib/server/db/pgcon";
import {authUser, userSession} from "$lib/server/db/schema";
import { Lucia, TimeSpan } from "lucia";
import { dev } from "$app/environment";
import { env } from '$env/dynamic/private';
import { Google } from "arctic";

const adapter = new DrizzlePostgreSQLAdapter(db, userSession, authUser);

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
			username: attributes.username,
			email: attributes.email,
			nombre: attributes.nombre,
			foto: attributes.foto,
			idn: attributes.idn,
			id_largo: attributes.id_largo,
			otros: attributes.otros
		};
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface OtrosDatosUsuario {
	empresa: number;
	perfil: string;
	codigo_perfil: string;
}

interface DatabaseUserAttributes {
	username: string;
	email: string;
	nombre: string;
	foto: string;
	idn: number;
	id_largo: string;
	otros: OtrosDatosUsuario;
}

const googleRedirectUrl = dev
	? 'http://localhost:5173/login/google/callback'
	: env.GOOGLE_REDIRECT_URI;

export const google = new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, googleRedirectUrl);