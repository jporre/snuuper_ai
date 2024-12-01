import { google, lucia } from '$lib/server/db/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { MongoDBCL } from "$lib/server/db/mongodb";
import { MongoDBMX } from "$lib/server/db/mongodbMX";
interface GoogleUser {
    sub: string; // Unique identifier for the user
    name: string; // Full name of the user
    email: string; // Email address of the user
    picture: string; // URL of the user's profile picture
}
export async function GET(event: RequestEvent): Promise<Response> {
    //  console.log("🚀 En callback ");
    const code = event.url.searchParams.get('code');
    const state = event.url.searchParams.get('state');
    const codeVerifier = event.cookies.get('google_oauth_code_verifier');
    const storedState = event.cookies.get('google_oauth_state') ?? null;
    if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
        return new Response(null, {
            status: 400
        });
    }
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();
    const googleUserResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    const googleUser: GoogleUser = await googleUserResponse.json();
    const existingUserCL = await MongoDBCL.collection('User').findOne({ email: googleUser.email });
    const existingUserMX = await MongoDBMX.collection('User').findOne({ email: googleUser.email });
    // El usuario podría existir en cualquiera de las dos bases de datos
    // Si existe en CL y no existe en MX se crea la sesión en CL y se declara event.locals.country como un array con un elemento CL
    // Si existe en MX y no existe en CL se crea la sesión en MX y se declara event.locals.country como un array con un elemento MX
    // Si existe en ambas bases de datos se crea la sesión en CL y se declara event.locals.country como un array con dos elementos CL y MX
    // Si no existe en ninguna base de datos se redirige a /login
    if (existingUserCL && !existingUserMX) {
        const userId = existingUserCL._id;
        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes
        });
        event.locals.country = ['CL'];
        redirect(302, '/CL/dh/tareas');
    } else if (existingUserMX && !existingUserCL) {
        const userId = existingUserMX._id;
        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes
        });
        event.locals.country = ['MX'];
        redirect(302, '/MX/dh/tareas');
    } else if (existingUserCL && existingUserMX) {
        const userId = existingUserCL._id;
        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes
        });
        event.locals.country = ['CL', 'MX'];
        redirect(302, '/CL/dh/tareas');
    } else {
        if (event.locals.session) {
            await lucia.invalidateSession(event.locals.session.id);
            const sessionCookie = lucia.createBlankSessionCookie();
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes
            });
        }
        redirect(302, '/login');
    }
    return new Response(JSON.stringify("Usuario o contraseña no encontrados"), {
        status: 302,
        headers: {
            Location: '/login'
        }
    });
}