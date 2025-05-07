import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { 
    getTask, 
    getStepDetails, 
    getTaskStats, 
    getCompanyInfo, 
    getTaskAnswers 
} from '$lib/server/data/tasks';
export const load = (async (event) => {
    if (!event.locals.user) {
        return redirect(302, "/login");
    }
    const taskId = event.params.id;
    const country = event.params.country;
    const objectIdPattern = /^[a-f\d]{24}$/i;
    if (!objectIdPattern.test(taskId)) {
        error(404, "El ID de la tarea no es válido.");
    }
    const taskData = await getTask(taskId, country);
    event.depends('app:getTask'); 
    if (!taskData) {
        error(404, "Tarea no encontrada.");
    }
    const companyId = taskData.constraints?.companyId?.[0]?.toString() ?? '';
    if (companyId && !objectIdPattern.test(companyId)) {
        error(400, "El ID de la compañía asociado a la tarea no tiene un formato válido.");
    }
    try {
        const companyInfo = await getCompanyInfo(companyId, country);
        const taskSteps = await getStepDetails(taskId, country);
        const taskStats = await getTaskStats(taskId, country);
        const taskAnswersData = await getTaskAnswers(taskId, country);
        return {
            tarea: taskData,
            pasos: taskSteps,
            respuestas: taskStats,
            taskId: taskId,
            country: country,
            company_info: companyInfo, 
            taskAnswers: taskAnswersData
        };
    } catch (e: any) {
        console.error("Error durante la carga de datos de la tarea:", e);
        if (e.status && typeof e.status === 'number') {
            throw e;
        }
        error(500, "Ocurrió un error al cargar los datos de la tarea.");
    }
}) satisfies PageServerLoad;
