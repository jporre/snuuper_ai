import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getActivetask, getStepDetails, getTaskStats } from '$lib/server/data/tasks';

export const load = (async (event) => {
    if (!event.locals.user) {
		return redirect(302, "/login");
	}
   const taskId = event.params.id;
   const objectIdPattern = /^[a-f\d]{24}$/i;

   if (!objectIdPattern.test(taskId)) {
      error(404, "TaskID no es Valido");
   }
   const taskData = await getActivetask(taskId);
   if (!taskData) {
      error(404, "Tarea no encontrada");
   }

   return {
      tarea : taskData,
      pasos: getStepDetails(taskId),
      respuestas: getTaskStats(taskId),
      taskId: taskId
   };
}) satisfies PageServerLoad;