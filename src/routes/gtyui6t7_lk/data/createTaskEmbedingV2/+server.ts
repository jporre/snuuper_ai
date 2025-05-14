import type { RequestHandler } from './$types';

import { env } from "$env/dynamic/private";
import { getTask, getTaskAnswers } from '$lib/server/data/tasks';
import { MongoDBCL } from '$lib/server/db/mongodb';
import { MongoDBMX } from '$lib/server/db/mongodbMX';
import { MongoDBQA } from '$lib/server/db/mongodbQA';
import { error, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY ?? '',
});
const MongoConn = MongoDBQA;
MongoDBCL;
MongoDBMX;
const CHUNK_SIZE = 2;
ObjectId;


export const POST: RequestHandler = async (event) => {
    // Valida usuario, obtiene pais y taskId 
        if (!event.locals.user) return redirect(302, "/login");
        const body = await event.request.json();
        if (!body?.taskId) throw error(400, 'No taskId provided');
        const taskId = body.taskId;
        if (!/^[a-f\d]{24}$/i.test(taskId)) throw error(404, "TaskID no es Valido");
        const tid = ObjectId.createFromHexString(taskId);
        const country = body.country ?? 'CL';

    let taskAnswers = await getTaskAnswers(taskId, country);
    const TaskData = await getTask(taskId, country);
    if (!TaskData) throw error(404, "Task no encontrada");
    if (!taskAnswers) throw error(404, "TaskAnswers no encontrada");
    // para no volver loco a openAI, se procesan en chunks de 10
     const chunks = [];
    for (let i = 0; i < taskAnswers.length; i += CHUNK_SIZE) {
        chunks.push(taskAnswers.slice(i, i + CHUNK_SIZE));
    }

     await Promise.all(chunks.map(chunk => processChunk(chunk, tid, TaskData.manual_ai)));

console.log("ok");
    return new Response(JSON.stringify({ message: 'Task answers embeddings created' }), { status: 200 });
};
async function processChunk(chunk: any[], tid: ObjectId, instrucciones: string) {
    const taskAnswersEmbeddings = await Promise.all(chunk.map(async (respuesta) => {
        const markdown = formatResponse(respuesta);
        const analisis = await getAnswerAnalisis(markdown, instrucciones);
        const vector_array = await getVectors(markdown);
        const analisisvector = await getVectors(analisis.output_text);
        return {
            taskId: tid,
            taskAnswerId: new ObjectId(respuesta._id),
            taskAnswers: respuesta,
            markdown: markdown,
            markdownEmbedding: vector_array.data[0].embedding,
            analisis: analisis.output_text,
            analisis_cost: analisis.usage,
            analisisEmbedding: analisisvector.data[0].embedding
        };
    }));
    await MongoConn.collection('ai_TaskAnswers').bulkWrite(
        taskAnswersEmbeddings.map(embedding => ({
            updateOne: {
                filter: { taskId: embedding.taskId, taskAnswerId: embedding.taskAnswerId },
                update: { $set: embedding },
                upsert: true
            }
        }))
    );
    console.log("procesado chunk");
    return taskAnswersEmbeddings;
}

function formatResponse(respuesta: any) {
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
        markdown += ` comentario general: ${respuesta.comment}\n`;
    }
    markdown += '\n';
    if (respuesta.stepAnswerDetails.length === 0) {
        markdown += 'No se respondió a ninguna pregunta.\n';
    } else {
        respuesta.stepAnswerDetails.forEach((stepAnswerDetail: any) => {
            const excludedTypes = ['photo', 'audio_record', 'paint', 'mapp_add_markers', 'rating'];
            if (excludedTypes.includes(stepAnswerDetail.tipo_paso)) {
                return;
            }
            if (Array.isArray(stepAnswerDetail.respuesta_texto)) {
                markdown += `- Nº ${stepAnswerDetail.orden} : ${stepAnswerDetail.texto_pregunta} r:\n`;
                stepAnswerDetail.respuesta_texto.forEach((opcionsSeleccionadas: any) => {
                    markdown += `  - ${(opcionsSeleccionadas as any)?.value || opcionsSeleccionadas}\n`;
                });
            } else {
                markdown += `- Nº ${stepAnswerDetail.orden} : ${stepAnswerDetail.texto_pregunta} r: ${stepAnswerDetail.respuesta_texto}\n`;
            }
        });
    }
    return markdown;
}

async function getAnswerAnalisis(markdown:string, instrucciones:string) {

    const queryAlModelo = `Utilizando el manual de instrucciones entregado, quiero que actúes como un analista experto en analisis de encuestas y analices el resultado de esta encuesta: \n${markdown} \n Recuerda que el informe debe ser en tono profesional, utilizando lenguaje coloquial y debe incluir un resumen de los resultados, una evaluación de la calidad de la encuesta y cualquier recomendación que consideres necesaria. \n\n\n`;

    const response = await openai.responses.create({
  model: "gpt-4.1-mini",
  input: [
    {
      "role": "system",
      "content": [
        {
          "type": "input_text",
          "text": instrucciones
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": queryAlModelo
        }
      ]
    }
  ],
  text: {
    "format": {
      "type": "text"
    }
  },
  reasoning: {},
  tools: [],
  temperature: 0.33,
  max_output_tokens: 6492,
  top_p: 0.88,
  store: true
});

    return response;
  
}

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

// async function procesOneAnswer(taskAnswers: any[], taskId: ObjectId) {
//     const TaskData = await getTask(String(taskId), country);
//     if (!TaskData) throw error(404, "Task no encontrada");
//     let primera_respuesta = taskAnswers[0];
//     console.log("id analizado", primera_respuesta._id);
//     let md = formatResponse(primera_respuesta);
//     //console.log("🚀 ~ constPOST:RequestHandler= ~ md:", md);
//     //console.log(" El system para el modelo es: ", TaskData.manual_ai);
//     const analisis = await getAnswerAnalisis(md, TaskData.manual_ai);
//     //console.log("🚀 ~ constPOST:RequestHandler= ~ analisis:", analisis)
//     const mdvector = await getVectors(md);
//     const analisisvector = await getVectors(analisis.output_text);
    
//     let taskAnswerId = new ObjectId(String(primera_respuesta._id));

//     let embedding_object = {
//     taskId: tid,
//     taskAnswerId: taskAnswerId,
//     taskAnswers: taskAnswers[0],
//     markdown: md,
//     markdownEmbedding: mdvector.data[0].embedding,
//     analisis: analisis.output_text,
//     analisis_cost: analisis.usage,
//     analisisEmbedding: analisisvector.data[0].embedding
    
// }
// // analisisEmbedding: analisisvector.data[0].embedding,
//     console.log("🚀 ~ constPOST:RequestHandler= ~ embedding_object:", embedding_object)

//     let mongoupdat = await MongoConn.collection('ai_TaskAnswers').updateOne(
//                    { taskId: tid, taskAnswerId: primera_respuesta._id },
//                    { $set: embedding_object },
//                    { upsert: true }
//                 );
// }