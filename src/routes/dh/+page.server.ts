import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getActivetasks } from '$lib/server/data/tasks';

export const load = (async (event) => {
    if (!event.locals.user) {
		return redirect(302, "/login/google");
	}

   return {
      tareas : await getActivetasks()
   };
}) satisfies PageServerLoad;