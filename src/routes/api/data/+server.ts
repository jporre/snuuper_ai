import { MongoDBCL } from '$lib/server/db/mongodb'; 
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) {
        return redirect(302, "/login");
    }
    const params = await event.request.json();
    const taskId = params.taskId;
        const tid = ObjectId.createFromHexString(taskId);
        const task = await MongoDBCL
        .collection('Task')
        .aggregate([{
            $match: {'constraints.status':'active'}},
            { $lookup: {
              from: 'company',
              localField: 'constraints.companyId',
              foreignField: '_id',
              as: 'companyDetails'
            }},
           {$project: {
            title: 1,
            description: 1,
            type: 1,
            subtype: 1,
            mode: 1,
            'reward.credits': 1,
            'reward.experience': 1,
            visibility: 1,
            'constraints.level': 1,
            'constraints.active': 1,
            'constraints.completionTime': 1,
           }}
        ]).toArray();
    
        let lista_tareas = JSON.stringify(task);
        console.log("🚀 ~ constPOST:RequestHandler= ~ lista_tareas:", lista_tareas)

    return new Response(lista_tareas,{ status: 200});
};