import type { PageServerLoad } from "./$types";
import { getActivetask, getStepDetails, getTaskAnswers, getTaskStats } from "$lib/server/data/tasks";
import  { agente_concerje } from "$lib/prompts";
import { redirect } from "@sveltejs/kit";


export const load: PageServerLoad = async (event) => {
    let taskId = '64ef3f104a58c728e21bf631';
    const userData = event.locals.user;
    if (!userData) { redirect(404, '/login'); }
    const taskAnswers = await getTaskAnswers(taskId);
    const taskData = await getActivetask(taskId);
    const agente = await agente_concerje({ origen: 'dashboard', promptName: 'agente_concerje', reemplazos: [{ name: "NOMBRE_USUARIO", value: userData?.personalData.firstname }] });
    return {
        tarea : taskData,
        pasos: getStepDetails(taskId),
        responseStats: await getTaskStats(taskId),
        taskAnswers:taskAnswers,
        taskId: taskId, 
        agente_concerje: agente
    };
    
};