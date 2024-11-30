import { i18n } from "$lib/i18n";
import { lucia } from "$lib/server/db/auth";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const securityHeaders = {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()',
    'Content-Security-Policy': "default-src 'self' ; script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://us-assets.i.posthog.com https://docs.google.com; connect-src 'self' https://ai.4c.cl https://accounts.google.com https://us.i.posthog.com https://storage.googleapis.com https://docs.google.com; img-src 'self' data: https://www.snuuper.com https://files.snuuper.com https://supabase.4c.cl https://www.gstatic.com https://lh3.googleusercontent.com https://storage.googleapis.com https://consoleminio.4c.cl https://tailwindui.com; style-src 'self' 'unsafe-inline' data: https://fonts.googleapis.com; frame-src 'self' https://accounts.google.com https://docs.google.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;"
};
export const addSecurityHeaders: Handle = async ({ event, resolve }) => {
    const response = await resolve(event);
    Object.entries(securityHeaders).forEach(([header, value]) => {
        response.headers.set(header, value);
    });
    return response;
};
export const authorization: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		event.locals.country = [];
		return resolve(event);
	}
	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		// sveltekit types deviates from the de-facto standard
		// you can use 'as any' too
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
	}
	event.locals.user = user;
	event.locals.session = session;
	event.locals.country = ['CL'];
	
    
	return resolve(event);
};

export const validateSession: Handle = async ({ event, resolve }) => {
    const session = event.locals.session;
    const pathname = event.url.pathname;
    if(!session && pathname.startsWith('/dh')) {
        throw redirect(303, '/login/google');
    }
	if(session && pathname.startsWith('/rt')) {
		return resolve(event);
    }
	if(session && pathname.startsWith('/logout')) {
		return resolve(event);
    }
	if(session && pathname.startsWith('/dh')) {
		return resolve(event);
    }
    
    return resolve(event);
};

const originalHandle = sequence(authorization, validateSession, addSecurityHeaders);
const handleParaglide: Handle = i18n.handle();
export const handle = sequence(originalHandle, handleParaglide);
