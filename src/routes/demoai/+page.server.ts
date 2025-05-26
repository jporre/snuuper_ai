import { getTask } from '$lib/server/data/tasks';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
     if (!event.locals.user) {
            return redirect(302, "/login/google");
        }
    let taskId = '623b224a0ed25957b8561146';
    let country = 'CL';

    const taskData =  await getTask(taskId, country);
    const userdata = {
        email: event.locals.user.email,
        firstname: event.locals.user.personalData.firstname,
        lastname: event.locals.user.personalData.lastname
    }


    return {taskData, userdata};
}) satisfies PageServerLoad;