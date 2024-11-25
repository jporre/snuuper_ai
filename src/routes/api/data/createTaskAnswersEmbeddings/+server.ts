import type { RequestHandler } from './$types';
import { env } from "$env/dynamic/private";
import { MongoDBCL } from '$lib/server/db/mongodb';
import { MongoDBQA } from '$lib/server/db/mongodbQA';
import { MongoDBMX } from '$lib/server/db/mongodbMX';
import { ObjectId } from 'mongodb';
import { redirect, error } from '@sveltejs/kit';
import { getTaskAnswers } from '$lib/server/data/tasks';
import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY ?? '',
});
const MongoConn = MongoDBQA;
export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) {
        return redirect(302, "/login");
    }
    const body = await event.request.json();
    if (!body) { throw error(400, 'No request data'); }
    if (!body.taskId) { throw error(400, 'No taskId provided'); }
    const taskId = body.taskId;
    const objectIdPattern = /^[a-f\d]{24}$/i;
    if (!objectIdPattern.test(taskId)) {
        throw error(404, "TaskID no es Valido");
    }

    const tid = ObjectId.createFromHexString(body.taskId);
    //console.log("🚀 ~ constPOST:RequestHandler= ~ tid:", tid);
    let taskAnswers = await getTaskAnswers(taskId);
    taskAnswers = taskAnswers.slice(0, 10);
    const taskAnswersEmbeddings = await Promise.all(taskAnswers.map(async (respuesta) => {
        const fecha_respuesta = new Date(respuesta.timestamp.start);
        const daysOfWeek = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const monthsOfYear = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const dayName = daysOfWeek[fecha_respuesta.getUTCDay()];
        const monthName = monthsOfYear[fecha_respuesta.getUTCMonth()];
        const weekNumber = Math.ceil((fecha_respuesta.getUTCDate() - 1) / 7);
        const hours = fecha_respuesta.getUTCHours().toString().padStart(2, '0');
        const minutes = fecha_respuesta.getUTCMinutes().toString().padStart(2, '0');
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        const formattedDate = ` ${dayName}, ${fecha_respuesta.getUTCDate()} de ${monthName} de ${fecha_respuesta.getUTCFullYear()}, a la ${hours}:${minutes} ${ampm}. Es la ${weekNumber}ª semana del año,  en el mes de ${monthName}.`;
        let markdown = `Esta encuesta se realizó ${formattedDate}\n`;
        if (respuesta.Address && respuesta.Address[0]) {
            markdown += `La encuesta fue realizada en *${respuesta.Address[0].nameAddress}* en la dirección: ${respuesta.Address[0].geolocation.physicalAddress},\n`;
        }
        if (respuesta.comment) {
            markdown += `El encuestador agregó el siguiente comentario: ${respuesta.comment}\n`;
        }
        markdown += '\n';
        if (respuesta.stepAnswerDetails.length === 0) {
            markdown += 'No se respondió a ninguna pregunta.\n';
        } else {
            respuesta.stepAnswerDetails.forEach((stepAnswerDetail) => {
                const excludedTypes = ['photo', 'audio_record', 'paint', 'mapp_add_markers', 'rating'];
                if (excludedTypes.includes(stepAnswerDetail.tipo_paso)) {
                    return;
                }
                if (Array.isArray(stepAnswerDetail.respuesta_texto)) {
                    markdown += `- Nº ${stepAnswerDetail.orden} de tipo: "${stepAnswerDetail.tipo_paso}" p: ${stepAnswerDetail.texto_pregunta} r:\n`;
                    stepAnswerDetail.respuesta_texto.forEach((opcionsSeleccionadas) => {
                        markdown += `  - ${(opcionsSeleccionadas as any)?.value || opcionsSeleccionadas}\n`;
                    });
                } else {
                    markdown += `- Nº ${stepAnswerDetail.orden} de tipo: "${stepAnswerDetail.tipo_paso}" p: ${stepAnswerDetail.texto_pregunta} r: ${stepAnswerDetail.respuesta_texto}\n`;
                }
            });
        }
        const vector_array = await getVectors(markdown);
        return {
            taskId: tid,
            taskAnswerId: new ObjectId(respuesta._id),
            taskAnswers: respuesta,
            markdown: markdown,
            markdownEmbedding: vector_array.data[0].embedding
        };
    }));
    // console.log("🚀 ~ constPOST:RequestHandler= ~ taskAnswersEmbeddings:", taskAnswersEmbeddings);
    const bulkOps = taskAnswersEmbeddings.map((embedding) => {
        const { taskId, taskAnswerId, taskAnswers, markdown, markdownEmbedding } = embedding;
        return {
            updateOne: {
                filter: { taskId: embedding.taskId, taskAnswerId: embedding.taskAnswerId },
                update: { $set: embedding },
                upsert: true
            }
        };
    });

    await MongoConn.collection('ai_TaskAnswers').bulkWrite(bulkOps);

    return new Response();
};

async function getVectors(searchString: string) {
    try {
        const searchVectors = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: searchString
        });
        // console.log(searchVectors);
        return searchVectors;
    } catch (e: any) {
        console.error('Error fetching embeddings:', e);
        throw error(e.status, e.message);
    }
}
