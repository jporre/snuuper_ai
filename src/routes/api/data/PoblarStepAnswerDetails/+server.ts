import { MongoDBCL } from '$lib/server/db/mongodb';
import { ObjectId } from 'mongodb'
export async function POST({ request }) {
    try {
        const params = await request.json();
        if (!params.taskId) {
            return new Response(JSON.stringify({ error: "No se proporcionó taskId" }), { status: 400 });
        }
        const MongoConnect = MongoDBCL;
        const taskId = params.taskId;
        const tid = ObjectId.createFromHexString(taskId);
        const TaskAnswer = await MongoConnect.collection('TaskAnswer')
            .find({ taskId: tid })
            .project({
                _id: 1,
                taskId: 1
            })
            .toArray();
        if (!TaskAnswer) {
            return new Response(JSON.stringify({ error: "Tarea no encontrada" }), { status: 404 });
        }
        TaskAnswer.forEach(async (taskAnswer) => {
            const taskAnswerId = taskAnswer._id;
            const taskAnswerIdStr = taskAnswerId.toString();
            const taskAnswerIdOb = ObjectId.createFromHexString(taskAnswerIdStr);
            const TaskAnswerSteps = await MongoConnect.collection('StepAnswer')
                .aggregate([
                    {
                        $match: {
                            taskAnswerId: taskAnswerIdOb
                        }
                    },
                    {
                        $lookup: {
                            from: 'Step',
                            localField: 'stepId',
                            foreignField: '_id',
                            as: 'stepDetails'
                        }
                    },
                    {
                        $unwind: '$stepDetails'
                    },
                    {
                        $project: {
                            stepAnswerId: '$_id',
                            taskAnswerId: '$taskAnswerId',
                            createdAt: '$createdAt',
                            updatedAt: '$updatedAt',
                            respuesta_cruda: '$data',
                            stepId: '$stepDetails._id',
                            tipo_paso: '$stepDetails.type',
                            texto_pregunta: '$stepDetails.instructionShort',
                            descripcion_pregunta: '$stepDetails.instruction',
                            orden: '$stepDetails.correlativeNumber',
                            alternativas: '$stepDetails.alternatives'
                        }
                    }
                ])
                .toArray();
            if (TaskAnswerSteps.length === 0) {
                return new Response(JSON.stringify({ error: 'Tarea no encontrada' }), { status: 404 });
            }
            // Procesar y agregar el campo `respuesta_texto` a cada elemento
            TaskAnswerSteps.forEach((item) => {
                const { tipo_paso, texto_pregunta, respuesta_cruda, alternativas } = item;
                let respuesta_texto;
                switch (tipo_paso) {
                    // case 'photo':
                    // case 'audio_record':
                    // case 'paint':
                    //     respuesta_texto = [respuesta_cruda];
                    //     break;
                    // case 'price_offer':
                    //     respuesta_texto = [respuesta_cruda];
                    //     break;
                    // case 'free_question':
                    //     respuesta_texto = [respuesta_cruda];
                    //     break;
                    case 'yes_no':
                    case 'mult_one':
                        const selectedOption = alternativas.find((alt) => alt.value === respuesta_cruda || alt._id.toString() === respuesta_cruda);
                        respuesta_texto = selectedOption ? [selectedOption.value] : [null];
                        break;
                    case 'mult_mult':
                    case 'check_list':
                    case 'scale_list':
                    case 'price_list':
                        respuesta_texto = Array.isArray(respuesta_cruda)
                            ? respuesta_cruda.map(respuesta => {
                                const alt = alternativas.find((alt: { _id: ObjectId; value: string }) => alt._id.toString() === respuesta.alternativeId.toString());
                                if (alt) {
                                    return {
                                        ...alt,
                                        selectedValue: respuesta.value
                                    };
                                }
                                return null;
                            }).filter(item => item !== null)
                            : [];
                        break;
                    case 'value_list':
                        respuesta_texto = Array.isArray(respuesta_cruda)
                            ? respuesta_cruda.map(respuesta => {
                                const alt = alternativas.find(alt => alt._id.toString() === respuesta.alternativeId.toString());
                                if (alt) {
                                    return {
                                        ...alt,
                                        selectedValue: respuesta.value
                                    };
                                }
                                return null;
                            }).filter(item => item !== null)
                            : [];
                        break;
                    // case 'date':
                    // case 'time':
                    // case 'price':
                    // case 'scale':
                    // case 'stock':
                    // case 'stock_single':
                    // case 'address':
                    case 'map_add_markers':
                        respuesta_texto = [{ ...respuesta_cruda }];
                        break;
                    default:
                        respuesta_texto = [respuesta_cruda];
                        break;
                }
                // Agregar el campo respuesta_texto al objeto
                item.respuesta_texto = respuesta_texto;
            });
            TaskAnswerSteps.sort((a, b) => a.orden - b.orden);
            const updateResult = await MongoConnect.collection('TaskAnswer').updateOne(
                { _id: taskAnswerIdOb }, // Filtro para encontrar el documento correspondiente
                { $set: { stepAnswerDetails: TaskAnswerSteps } } // Establece el nuevo campo
            );
            if (updateResult.matchedCount === 0) {
                return new Response(JSON.stringify({ error: 'No se encontró el documento en TaskAnswer' }), { status: 404 });
            }
        });
        return new Response(JSON.stringify(TaskAnswer), { status: 200 });
    } catch (error) {
        console.error("Error al manejar la solicitud:", error);
        return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
    }
}
