import type { PageServerLoad } from "./$types";
import { getActivetask, getStepDetails, getTaskAnswers, getTaskStats } from "$lib/server/data/tasks";


export const load: PageServerLoad = async () => {
    let taskId = '67294845452abb00862efee9';
    const taskAnswers = await getTaskAnswers(taskId);
    const taskData = await getActivetask(taskId);
    return {
        tarea : taskData,
        pasos: getStepDetails(taskId),
        responseStats: await getTaskStats(taskId),
        taskAnswers:taskAnswers,
        taskId: taskId
    };
    
};