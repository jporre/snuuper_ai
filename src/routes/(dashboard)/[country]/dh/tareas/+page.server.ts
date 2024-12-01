import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getActivetasks } from '$lib/server/data/tasks';

export const load = (async (event) => {
    if (!event.locals.user) {
		return redirect(302, "/login/google");
	}
   const country = event.params.country; 
   return {
      tareas : getActivetasks(country)
   };
}) satisfies PageServerLoad;