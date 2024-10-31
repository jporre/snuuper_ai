import { Lucia, TimeSpan } from "lucia";
import { dev } from "$app/environment";
import { env } from '$env/dynamic/private';
import { Google } from "arctic";

//* Este es el caso en que la base de datos de usuarios esté en postgresql
//import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
//import {db} from "$lib/server/db/pgcon";
//const adapter = new DrizzlePostgreSQLAdapter(db, userSession, authUser);

//* Este es el caso en que la base de datos de usuarios esté en mongodb
import { Collection, MongoClient, ObjectId } from 'mongodb';  
import { MONGODB_HOST, MONGODB_USERNAME, MONGODB_PASSWORD } from '$env/static/private';
import { MongodbAdapter } from '@lucia-auth/adapter-mongodb';

const client = new MongoClient(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}/?retryWrites=true&w=majority`);
await client.connect();
const MongoDBCL = client.db('snuuper');
const User = MongoDBCL.collection("User") as Collection<DatabaseUserAttributes>;
const Session = MongoDBCL.collection("Sessions") as Collection<SessionDoc>;
const adapter = new MongodbAdapter(Session, User);


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

// Esta es la definicion de la tabla en la BD donde se guardaran las Sessiones
interface SessionDoc {
	_id: string;
	expires_at: Date;
	user_id: ObjectId;
}
// Estos son los datos del usuario que estàn (o estarán) en la tabla de la base de datos)
interface DatabaseUserAttributes {
	_id: ObjectId;
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