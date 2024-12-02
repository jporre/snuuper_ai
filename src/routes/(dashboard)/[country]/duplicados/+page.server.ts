import  { getDuplicados } from '$lib/server/data/tasks';
import { MongoDBCL } from '$lib/server/db/mongodb'; 
import { MongoDBQA } from '$lib/server/db/mongodbQA';
import { MongoDBMX } from '$lib/server/db/mongodbMX';
import { MongoClient, ObjectId } from 'mongodb';
let MongoConn = MongoDBCL;
/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
    
    const country = event.params.country; 
    if (!event.locals.user) { return { status: 404 }; }
    if (!country) { return { status: 404 }; }
    if(country === 'MX') { MongoConn = MongoDBMX;  } else  { MongoConn = MongoDBCL; }
    const tasks = await MongoConn.collection('Task')
            .find({ 'constraints.status': 'active',  subtype: 'paid' })
            .project({ _id: 1 })
            .toArray();
        if (!tasks || tasks.length === 0) {
            return new Response(JSON.stringify({ error: "Tarea no encontrada" }), { status: 404 });
        }
     
     const groupDuplicados = await Promise.all(
        tasks.map(async (task) => {
            const taskAnswerIdStr = task._id.toString();
            return await getDuplicados(taskAnswerIdStr, MongoConn);
        })
    );
    
    const resultado = JSON.stringify(groupDuplicados.flat());
    const count = groupDuplicados.flat().length;
    return { td: JSON.parse(resultado) , count: count };
};