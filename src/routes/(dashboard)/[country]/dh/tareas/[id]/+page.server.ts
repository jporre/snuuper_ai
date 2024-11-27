import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTask, getStepDetails, getTaskStats, getTaskAnswerEmbedingsFromMongo, getCompanyInfo } from '$lib/server/data/tasks';

export const load = (async (event) => {
    if (!event.locals.user) {
		return redirect(302, "/login");
	}
   const taskId = event.params.id;
   const objectIdPattern = /^[a-f\d]{24}$/i;

   if (!objectIdPattern.test(taskId)) {
      error(404, "TaskID no es Valido");
   }
   const country = event.locals.country[0];
   const taskData = await getTask(taskId, country);
   event.depends('app:getTask');
   if (!taskData) {
      error(404, "Tarea no encontrada");
   }
   //const emb = await getTaskAnswerEmbedingsFromMongo(taskId)
   const companyId = taskData.constraints?.companyId[0]?.toString() ?? '';
  //  const company_info = await getCompanyInfo(companyId);
  //  if (!company_info) { error(404, 'Company info not found') }


   return {
      tarea : taskData,
      pasos: getStepDetails(taskId, country),
      respuestas: getTaskStats(taskId, country),
      taskId: taskId,
      country: country,
      company_info: getCompanyInfo(companyId, country)
   };
}) satisfies PageServerLoad;