import { redirect, type Actions } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
    if (!event.locals.user) {
		return redirect(302, "/login/google");
	}
    const userData = event.locals.user;
    const PublicUserData = { nombre: userData.nombre, email: userData.email, foto: userData.foto };
    return {userData: PublicUserData};
}) satisfies LayoutServerLoad;
