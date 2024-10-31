import { OAuth2RequestError, ArcticFetchError, decodeIdToken } from 'arctic';
import { google, lucia } from '$lib/server/db/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { MongoDBCL } from "$lib/server/db/mongodb";

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

    try {
        const tokens = await google.validateAuthorizationCode(code, codeVerifier);
        const accessToken = tokens.accessToken();
       
        const googleUserResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const googleUser: GoogleUser = await googleUserResponse.json();
        const existingUser = await MongoDBCL.collection('User').findOne({ email: googleUser.email });
        // el usuario ya existe en la base de datos
        if (existingUser) {
            const userId = existingUser._id;
            
                const session = await lucia.createSession(userId, {});
                const sessionCookie = lucia.createSessionCookie(session.id);
                event.cookies.set(sessionCookie.name, sessionCookie.value, {
                    path: '.',
                    ...sessionCookie.attributes
                });
            redirect(302, '/dh');
        } else {
            // el usuario no existe, pero era un usuario valido de google.
            if (event.locals.session) {
                await lucia.invalidateSession(event.locals.session.id);
                const sessionCookie = lucia.createBlankSessionCookie();
                event.cookies.set(sessionCookie.name, sessionCookie.value, {
                    path: ".",
                    ...sessionCookie.attributes
                });
            }
        }
        return new Response(JSON.stringify("Usuario o contraseña no encontrados"), {
            status: 302,
            headers: {
                Location: '/'
            }
        });

    } catch (e) {
        //  console.log("🚀 ~ ln 95 ~ e:", e);
        if (e instanceof OAuth2RequestError) {
            redirect(302, '/');
        }
        redirect(302, '/dh');
        return new Response(null, {
            status: 500,
            headers: {
                Location: '/'
            }
        });
    }
}