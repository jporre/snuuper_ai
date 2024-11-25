import { MongoDBCL } from '$lib/server/db/mongodb'; 
import { MongoDBQA } from '$lib/server/db/mongodbQA';
import { MongoDBMX } from '$lib/server/db/mongodbMX';

import { ObjectId } from 'mongodb';

export async function POST({ request: req }) {
    try {
        const params = await req.json();

        // Conexión a la colección Task _id: new ObjectId('66fd34542901830086cb168b'),
        const MongoConn = MongoDBCL;
        const tasks = await MongoConn.collection('Task')
            .find({ 'constraints.status': 'active',  subtype: 'paid' })
            .project({ _id: 1 })
            .toArray();

        if (!tasks || tasks.length === 0) {
            return new Response(JSON.stringify({ error: "Tarea no encontrada" }), { status: 404 });
        }

        // Procesamiento de duplicados usando Promise.all
        const groupDuplicados = await Promise.all(
            tasks.map(async (task) => {
                const taskAnswerIdStr = task._id.toString();
                return await getDuplicados(taskAnswerIdStr, MongoConn);
            })
        );

        const resultado = JSON.stringify(groupDuplicados.flat());// Aplanamos el array para evitar anidaciones
        const count = groupDuplicados.flat().length;
        // console.log("🚀 ~ POST ~ count:", count)
        return new Response(resultado, { status: 200 });
        
    } catch (error) {
        console.error("Error al manejar la solicitud:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
    }
}

// Función para obtener duplicados
async function getDuplicados(taskId: string, MongoConn) {
    try {
        const tid = new ObjectId(taskId);
        const TaskAnswer = await MongoConn.collection('TaskAnswer')
        .aggregate([
            {
                '$match': {
                    'taskId': tid,
                    'status': { '$in': ['approved', 'approved_recurrent', 'pending', 'pending_recurrent'] }
                }
            },
            {
                '$lookup': {
                    'from': 'User',  // Nombre de la colección de usuarios
                    'localField': 'userId',
                    'foreignField': '_id',
                    'as': 'userDetails'
                }
            },
            {
                '$unwind': '$userDetails'
            },
            // {
            //     '$match': {
            //         'userDetails.accountData.role': 'user'  // Filtra solo usuarios con el rol 'user'
            //     }
            // },
            {
                '$group': {
                    '_id': {
                        'taskId': '$taskId',
                        'addressId': '$addressId',
                        'userId': '$userId',
                        'timestampStart': '$timestamp.start'
                    },
                    'count': { '$sum': 1 },
                    'userDetails': {
                        '$first': {
                            'userId': '$userId',
                            'userEmail': '$userDetails.email',
                            'firstName': '$userDetails.personalData.firstname',
                            'lastName': '$userDetails.personalData.lastname',
                            'role': '$userDetails.accountData.role',
                            'status': '$status'
                        }
                    },
                    'documents': {
                        '$push': {
                            'TaskAnswerId': '$_id',
                            'status': '$status',
                            'timestampStart': { '$getField': { 'field': 'start', 'input': '$timestamp' } },
                            'timestampStop': { '$getField': { 'field': 'stop', 'input': '$timestamp' } }
                        }
                    }
                }
            },
            {
                '$match': {
                    'count': { '$gt': 1 }
                }
            },
            {
                '$project': {
                    '_id': 0,
                    'groupKey': '$_id',
                    'count': 1,
                    'userDetails': 1,
                    'documents': 1
                }
            },
            {
                '$sort': { 'count': -1 }
            }
        ])
        .toArray();
    

        if (!TaskAnswer || TaskAnswer.length === 0) {
            return []; // Retorna un array vacío si no hay duplicados
        }

        // Mapear resultados a detalle duplicado
        return TaskAnswer.map(taskAnswer => ({
            taskId: taskAnswer.groupKey.taskId,
            addressId: taskAnswer.groupKey.addressId,
            userId: taskAnswer.userDetails.userId,
            userName: `${taskAnswer.userDetails.firstName} ${taskAnswer.userDetails.lastName}`,
            userRole: taskAnswer.userDetails.role,
            userEmail: taskAnswer.userDetails.userEmail,
            timestampStart: taskAnswer.groupKey.timestampStart,
            count: taskAnswer.count,
            documents: taskAnswer.documents
        }));

    } catch (error) {
        console.error("Error en getDuplicados:", error);
        throw new Error("Error al obtener duplicados"); // Lanzar error para manejo en la función principal
    }
}
