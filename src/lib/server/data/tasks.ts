import { MongoDBCL } from '$lib/server/db/mongodb'; 
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export async function getActivetasks() {
    const task = await MongoDBCL
        .collection('Task')
        .aggregate([{
            $match: {'constraints.status':'active'}
        },
            { $lookup: {
              from: 'Company',
              localField: 'constraints.companyId',
              foreignField: '_id',
              as: 'companyDetails'
            }},
           {$project: {
            _id:1,
            title: 1,
            description: 1,
            type: 1,
            subtype: 1,
            mode: 1,
            createdAt: 1,
            companyDetails: 1,
            'reward.credits': 1,
            'reward.experience': 1,
            visibility: 1,
            "status":"$constraints.status",
            'constraints.level': 1,
            'constraints.active': 1,
            'constraints.completionTime': 1,
           }}
        ]).toArray();
        
        let lista_tareas = JSON.parse(JSON.stringify(task));
       // console.log("🚀 ~ getActivetasks ~ lista_tareas:", lista_tareas)
    
        return lista_tareas;
}

export async function getActivetask(taskId: string) {
    const tid = ObjectId.createFromHexString(taskId);
    const task = await MongoDBCL
        .collection('vi_ActiveTask').findOne({_id: tid});
        
        let tarea = JSON.parse(JSON.stringify(task));
       // console.log("🚀 ~ getActivetasks ~ lista_tareas:", lista_tareas)
    
        return tarea;
}