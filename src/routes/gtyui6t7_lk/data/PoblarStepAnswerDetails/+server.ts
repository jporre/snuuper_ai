import { env } from "$env/dynamic/private";
import { getTask } from '$lib/server/data/tasks.js';
import { MongoDBCL } from '$lib/server/db/mongodb';
import { MongoDBMX } from '$lib/server/db/mongodbMX';
import { ObjectId } from 'mongodb';
import { z } from "zod";

import { error } from "@sveltejs/kit";
import OpenAI from 'openai';
import { zodTextFormat } from "openai/helpers/zod.mjs";

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY ?? '',
});

let MongoConn = MongoDBCL;

const comentTags = z.object({
    sentiment: z.enum(['positive', 'neutral', 'negative', 'undetermined']),
    tags: z.array(z.string()),
});

export async function POST({ request }) {
    try {
        const params = await request.json();
        if (!params.taskId) {
            return new Response(JSON.stringify({ error: "No se proporcionó taskId" }), { status: 400 });
        }

        const taskId = params.taskId;
        const country = params.country;
        if (country === 'MX') { MongoConn = MongoDBMX; } else { MongoConn = MongoDBCL; }
        const tid = ObjectId.createFromHexString(taskId);
        const task = await getTask(taskId, country);

        if (!task) { error(404, 'Task not found') }
        let TaskAnswer = await MongoConn.collection('TaskAnswer')
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

            let TaskAnswerSteps = await MongoConn.collection('StepAnswer')
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
                    case 'free_question':
                        respuesta_texto = [respuesta_cruda];
                        break;
                    case 'yes_no':
                    case 'mult_one':
                        const selectedOption = alternativas.find((alt: any) => alt.value === respuesta_cruda || alt._id.toString() === respuesta_cruda);
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
                                const alt = alternativas.find((alt: { _id: { toString: () => any; }; }) => alt._id.toString() === respuesta.alternativeId.toString());
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

            let tags = await getAiSummaryOnTaskAnswer(TaskAnswerSteps);

            TaskAnswerSteps = [...TaskAnswerSteps, { tipo_paso: 'ai', texto_pregunta: 'Se pide analizar los textos libres, obteniendo etiquetas y sentimiento de todas las respuestas', respuesta_texto: tags }];

            const updateResult = await MongoConn.collection('TaskAnswer').updateOne(
                { _id: taskAnswerIdOb }, // Filtro para encontrar el documento correspondiente
                { $set: { stepAnswerDetails: TaskAnswerSteps } } // Establece el nuevo campo
            );
            if (updateResult.matchedCount === 0) {
                return new Response(JSON.stringify({ error: 'No se encontró el documento en TaskAnswer' }), { status: 404 });
            }
        });
        return new Response(JSON.stringify(TaskAnswer), { status: 200 });
    } catch (error) {

        return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
    }
}

async function getAiSummaryOnTaskAnswer(taskAnswerDetails: any) {

    const taskAnswerDetailsOb = taskAnswerDetails;
    // Primero obtenemos cualquiera que sea free_question
    const freeQuestion = taskAnswerDetailsOb.filter((item: any) => item.tipo_paso === 'free_question');
    const context = 'Por favor, a partir de la siguiente pregunta y respuesta , dame una o mas etiquetas relevantes para la tarea. , es importante que digas si es de tono positivo , neutro,  negativo o sindeterminar';
    const task = freeQuestion.map((item: any) => {
        return {
            question: item.texto_pregunta,
            answer: item.respuesta_texto[0]
        };
    });

    //  const tareasComentarios = 
    const aiReview = await openaiHelper(context, task);

    // const result = await MongoConn.collection('TaskAnswer').updateOne(
    //     { _id: taskAnswerIdOb },
    //     { $set: { stepAnswerAISummary: taskAnswerDetailsOb } }
    // );
    return aiReview;
}

async function openaiHelper(context: string, task: string) {

    let input = [];
    const json = JSON.stringify(task);
    const system_prompt = {
        "role": "system",
        "content": [
            {
                "type": "input_text",
                "text": "Por favor, a partir de la siguiente pregunta y respuesta , dame una o mas etiquetas descriptivas de la respuesta. , es importante que digas si es de tono DE LA RESPUESTA es positivo , neutro,  negativo o sindeterminar"
            }
        ]
    }
    const user_prompt = {
        "role": "user",
        "content": [
            {
                "type": "input_text",
                "text": `json: ${json}`
            }
        ]
    }
    input.push(system_prompt);
    input.push(user_prompt);



    const response = await openai.responses.parse({
        model: "gpt-4.1-nano",
        input: input,
        text: {
            format: zodTextFormat(comentTags, "tags"),
        }
    });
    const tags = response.output_parsed;

    return tags;
}
