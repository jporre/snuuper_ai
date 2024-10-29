import { fail, redirect } from "@sveltejs/kit";
import { lucia } from "$lib/server/db/auth";

import type { Actions, PageServerLoad } from "./$types";

export const load = async (event) => {
	if (!event.locals.session) {
		redirect(302, "/");
	}
	// await lucia.invalidateSession(event.locals.session.id);
	// const sessionCookie = lucia.createBlankSessionCookie();
	// event.cookies.set(sessionCookie.name, sessionCookie.value, {
	// 	path: ".",
	// 	...sessionCookie.attributes
	// });
	return {serverMessage: 'Gracias'};
};

export const actions: Actions = {
	logout: async (event) => {
		console.log("saliendo");
		if (!event.locals.session) {
			
			redirect(302, "/");
		}
		await lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
		redirect(302, "/");
	}
};