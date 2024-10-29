import { OAuth2RequestError, ArcticFetchError, decodeIdToken } from 'arctic';
import { google, lucia } from '$lib/server/db/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db/pgcon';
import { redirect } from '@sveltejs/kit';
import { authUser, oauthAccount } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

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
       


        const existingUser = await db.select().from(authUser).where(and(eq(authUser.email, googleUser.email), eq(authUser.activo, 2))).limit(1).execute();
        // el usuario ya existe en la base de datos
        if (existingUser) {
            const userId = existingUser[0].id;
            // pero... existe con google ?
            const existingGoogleUser = await db.select().from(oauthAccount).where(and(eq(oauthAccount.providerId, 'google'), eq(oauthAccount.providerUserId, googleUser.sub))).limit(1).execute();

            if (existingGoogleUser) {
                await db.update(authUser).set({ foto: googleUser.picture }).where(eq(authUser.id, userId)).execute();
                // existe tb con google entonces solo me falta crear la session y mandarlo de veulta a la pagina principal
                const session = await lucia.createSession(userId, {});
                const sessionCookie = lucia.createSessionCookie(session.id);
                event.cookies.set(sessionCookie.name, sessionCookie.value, {
                    path: '.',
                    ...sessionCookie.attributes
                });
                
            } else {
                // el usuario existe pero no tiene registrada su cuenta de google, entonces lo registro y lo dejo pasar. 
                const newOAuthAccount = await db.insert(oauthAccount).values({
                    userId: userId,
                    providerId: 'google',
                    providerUserId: googleUser.sub
                }).execute();

                const session = await lucia.createSession(userId, {});
                const sessionCookie = lucia.createSessionCookie(session.id);
                event.cookies.set(sessionCookie.name, sessionCookie.value, {
                    path: '.',
                    ...sessionCookie.attributes
                });
            } 
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