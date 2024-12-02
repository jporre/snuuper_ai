import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getCampanias, getDetalleCampaniaById } from '$lib/server/data/pg';
import type { Actions } from './$types';

export const load = (async (event) => {
    const { country } = event.params;
    if (!event.locals.user) {return redirect(302, "/login/google");}

    return { campanias: await getCampanias() };
}) satisfies PageServerLoad;

    export const actions: Actions = {
        default: async (event) => {
            //console.log('request', event);
            const formData = await event.request.formData();
            console.log("🚀 ~ default: ~ formData:", formData)
            
            const campaniaIdRaw = formData.get('campaniaId');
            const campaniaId = Number(campaniaIdRaw);
            console.log("🚀 ~ default: ~ campaniaId:", campaniaId)

            if (isNaN(campaniaId)) {
                return { status: 400, body: { error: 'Campania ID must be a number' } };
            }

            if (!campaniaId) {
                return { status: 400, body: { error: 'Campania ID is required' } };
            }

            try {
                const detalleCampania = await getDetalleCampaniaById(campaniaId);
                console.log("🚀 ~ default: ~ detalleCampania:", detalleCampania)
                return {dt: detalleCampania};
            } catch (error) {
                return { status: 500, body: { error: 'Failed to fetch campania details' } };
            }
        }
    };
