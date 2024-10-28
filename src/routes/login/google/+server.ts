import { google } from '$lib/server/db/auth';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { generateCodeVerifier, generateState } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const scopes = ['profile', 'email'];

	const url = await google.createAuthorizationURL(state, codeVerifier, scopes);
	//  console.log("🚀 ~ GET ~ url:", url);

	event.cookies.set('google_oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	event.cookies.set('google_oauth_code_verifier', codeVerifier, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

    //return new Response(null, {});

	return redirect(302, url.toString());
}