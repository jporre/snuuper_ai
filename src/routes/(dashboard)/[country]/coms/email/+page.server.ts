import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getCampanias } from '$lib/server/data/pg';

export const load = (async (event) => {
    const { country } = event.params;
    if (!event.locals.user) {return redirect(302, "/login/google");}

    return { campanias: await getCampanias() };
}) satisfies PageServerLoad;