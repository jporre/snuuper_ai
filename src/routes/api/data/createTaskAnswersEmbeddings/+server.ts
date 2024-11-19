import type { RequestHandler } from './$types';
import { env } from "$env/dynamic/private";
import { MongoDBCL } from '$lib/server/db/mongodb';
import { ObjectId } from 'mongodb';
import { redirect, error } from '@sveltejs/kit';
import { getTaskAnswers } from '$lib/server/data/tasks';
import { MongoDBQA } from '$lib/server/db/mongodbQA';
import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY ?? '',
});

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
    const taskAnswers = await getTaskAnswers(taskId);
    const taskAnswersEmbeddings = await Promise.all(taskAnswers.map(async (respuesta) => {
        let markdown = `Esta encuesta se inició en ${respuesta.timestamp.start} y terminó en ${respuesta.timestamp.stop}\n`;
        if (respuesta.Address !== undefined) {
            markdown += `La encuesta fue realizada en *${respuesta.Address[0].nameAddress}* en la dirección: ${respuesta.Address[0].geolocation.physicalAddress},\n`;
        }
        if (respuesta.comment) {
            markdown += `El encuestador agregó el siguiente comentario: ${respuesta.comment}\n`;
        }
        markdown += '\n';
        respuesta.stepAnswerDetails.forEach((stepAnswerDetail) => {
            const excludedTypes = ['photo', 'audio_record', 'paint', 'mapp_add_markers', 'rating'];
            if (excludedTypes.includes(stepAnswerDetail.tipo_paso)) {
                return;
            }
            if (Array.isArray(stepAnswerDetail.respuesta_texto)) {
                markdown += `- Nº ${stepAnswerDetail.orden} de tipo: "${stepAnswerDetail.tipo_paso}" p: ${stepAnswerDetail.texto_pregunta} r:\n`;
                stepAnswerDetail.respuesta_texto.forEach((opcionsSeleccionadas) => {
                    markdown += `  - ${opcionsSeleccionadas?.value || opcionsSeleccionadas}\n`;
                });
            } else {
                markdown += `- Nº ${stepAnswerDetail.orden} de tipo: "${stepAnswerDetail.tipo_paso}" p: ${stepAnswerDetail.texto_pregunta} r: ${stepAnswerDetail.respuesta_texto}\n`;
            }
        });
        const vector_array = await getVectors(markdown);
        return {
            taskId: tid,
            taskAnswerId: ObjectId.createFromHexString(respuesta._id),
            taskAnswers: respuesta,
            markdown: markdown,
            markdownEmbedding: vector_array.data[0].embedding
        };
    }));
    // console.log("🚀 ~ constPOST:RequestHandler= ~ taskAnswersEmbeddings:", taskAnswersEmbeddings);
    // Insertar en ai_TaskAnswers la lista de taskAnswersEmbeddings usando MongoDBQA
    const InsertRegistros = await MongoDBQA.collection('ai_TaskAnswers').insertMany(taskAnswersEmbeddings);
    const bulkOps = taskAnswersEmbeddings.map((embedding) => ({
        updateOne: {
            filter: { taskId: embedding.taskId, taskAnswerId: embedding.taskAnswerId },
            update: { $set: embedding },
            upsert: true
        }
    }));

    const result = await MongoDBQA.collection('ai_TaskAnswers').bulkWrite(bulkOps);
    console.log("🚀 ~ constPOST:RequestHandler= ~ result:", result);

    return new Response();
};

async function getVectors(searchString: string) {
    try {
        const searchVectors = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: searchString
        });
        console.log(searchVectors);
        return searchVectors;
    } catch (e: any) {
        console.error('Error fetching embeddings:', e);
        throw error(e.status, e.message);
    }
}
