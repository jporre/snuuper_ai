import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getActivetask, getStepDetails, getTaskStats } from '$lib/server/data/tasks';

export const load = (async (event) => {
    if (!event.locals.user) {
		return redirect(302, "/login/google");
	}
    let taskId = event.params.id;
  // let tarea = await getActivetasks();
  // console.log("🚀 ~ load ~ tarea:", tarea)
   return {
      tarea : await getActivetask(taskId),
      pasos: getStepDetails(taskId),
      respuestas: getTaskStats(taskId)
   };
}) satisfies PageServerLoad;