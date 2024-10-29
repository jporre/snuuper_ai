import { redirect, type Actions } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
    if (!event.locals.user) {
		return redirect(302, "/login/google");
	}
   
    return {userData: { nombre: event.locals.user.nombre, email: event.locals.user.email, foto: event.locals.user.foto }};
}) satisfies LayoutServerLoad;
