import type { RequestHandler } from './$types';
import { MongoDBCL } from '$lib/server/db/mongodb';
import { ObjectId } from 'mongodb';
import { redirect, error } from '@sveltejs/kit';
import { getTasksAnswers } from '$lib/server/data/tasks';


export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) {
		return redirect(302, "/login");
	}
    const body = await event.request.json();
    if (!body) { error(400, 'No request data') }
    if (!body.taskId) { error(400, 'No taskId provided') }
    const taskId = body.taskId;
    const objectIdPattern = /^[a-f\d]{24}$/i;
    if (!objectIdPattern.test(taskId)) {
        error(404, "TaskID no es Valido");
     }

    const tid = ObjectId.createFromHexString(body.taskId);
    //console.log("🚀 ~ constPOST:RequestHandler= ~ tid:", tid);
    const taskAnswersList = await getTasksAnswers(body.taskId);
    //console.log("🚀 ~ constPOST:RequestHandler= ~ taskAnswersList:", taskAnswersList)

  
    
    return new Response();
};