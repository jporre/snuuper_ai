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
const CHUNK_SIZE = 4; // Number of answers processed by a single processChunk call
const PARALLEL_OPERATIONS_COUNT = 30; // Number of processChunk calls to run in parallel
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

    let allTaskAnswersFromDB = await getTaskAnswers(taskId, country);
    const TaskData = await getTask(taskId, country);

    if (!TaskData) throw error(404, "Task no encontrada");
    if (!allTaskAnswersFromDB || allTaskAnswersFromDB.length === 0) {
        console.log("No task answers found in the original source for this task.");
        return new Response(JSON.stringify({ message: 'No task answers found to process' }), { status: 200 });
    }

    // Fetch existing processed answer IDs from ai_TaskAnswers
    const existingProcessedAnswers = await MongoConn.collection('ai_TaskAnswers')
        .find({ taskId: tid }, { projection: { taskAnswerId: 1 } })
        .toArray();
    
    const processedAnswerIds = new Set(existingProcessedAnswers.map(doc => doc.taskAnswerId.toString()));
    
    console.log(`Found ${processedAnswerIds.size} already processed answers for taskId: ${taskId}`);

    // Filter out answers that have already been processed
    const taskAnswersToProcess = allTaskAnswersFromDB.filter(answer => !processedAnswerIds.has(new ObjectId(String(answer._id)).toString()));

    if (taskAnswersToProcess.length === 0) {
        console.log(`All ${allTaskAnswersFromDB.length} answers for taskId: ${taskId} have already been processed.`);
        return new Response(JSON.stringify({ message: 'All task answers already processed' }), { status: 200 });
    }
    
    console.log(`Processing ${taskAnswersToProcess.length} new answers out of ${allTaskAnswersFromDB.length} total for taskId: ${taskId}.`);

    // Create all sub-chunks (each sub-chunk contains CHUNK_SIZE answers)
    const allSubChunks = [];
    for (let i = 0; i < taskAnswersToProcess.length; i += CHUNK_SIZE) {
        allSubChunks.push(taskAnswersToProcess.slice(i, i + CHUNK_SIZE));
    }

    // Process these sub-chunks in parallel groups
    for (let i = 0; i < allSubChunks.length; i += PARALLEL_OPERATIONS_COUNT) {
        const batchOfSubChunks = allSubChunks.slice(i, i + PARALLEL_OPERATIONS_COUNT);
        
        console.log(`Starting a parallel group of ${batchOfSubChunks.length} sub-chunk operations.`);
        
        const promises = batchOfSubChunks.map(subChunk =>
            processChunk(subChunk, tid, TaskData.manual_ai)
        );
        await Promise.all(promises);
        
        console.log(`Completed a parallel group of ${batchOfSubChunks.length} sub-chunk operations.`);
    }

    console.log("All new task answers processed.");
    return new Response(JSON.stringify({ message: 'New task answers embeddings created successfully' }), { status: 200 });
};

async function processChunk(chunk: any[], tid: ObjectId, instrucciones: string) {
    if (!chunk || chunk.length === 0) {
        console.log("Empty chunk received in processChunk, skipping.");
        return [];
    }
    console.log(`Processing a chunk of ${chunk.length} answers.`);
    const taskAnswersEmbeddings = await Promise.all(chunk.map(async (respuesta) => {
        //Convertir la respuesta  a un string, para poder reemplazar cualquier parte del texto donde diga "Papa John%s"  (% es un comodin donde puede estar ' o ` por "Pizza Paradise". Luego de reemplazar, volver a serializar para poder seguir con el proceso.
        const respuestaString = JSON.stringify(respuesta);
        const sanitizedRespuesta = respuestaString.replace(/Papa John/g, 'Pizza Paradi');
      //  console.log("🚀 ~ taskAnswersEmbeddings ~ sanitizedRespuesta:", sanitizedRespuesta)
        try {
            respuesta = JSON.parse(sanitizedRespuesta);
        } catch (e) {
            console.error(`Error parsing answer ${respuesta._id} in processChunk:`, e);
            return null; // Skip this answer if parsing fails
        }
        const markdown = formatResponse(respuesta);
        try {
            const analisis = await getAnswerAnalisis(markdown, instrucciones);
            // Ensure analisis and analisis.output_text are valid before proceeding
            if (!analisis || typeof analisis.output_text !== 'string') {
                console.error(`Error or invalid analysis for answer ${respuesta._id}: Missing output_text.`);
                return null; // Skip this answer
            }
            const vector_array = await getVectors(markdown);
            const analisisvector = await getVectors(analisis.output_text);

            // Ensure embeddings were successfully created
            if (!vector_array?.data?.[0]?.embedding || !analisisvector?.data?.[0]?.embedding) {
                console.error(`Error generating embeddings for answer ${respuesta._id}.`);
                return null; // Skip this answer
            }
            
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
        } catch (e: any) {
            console.error(`Error processing answer ${respuesta._id} in processChunk: ${e.message}`, e);
            return null; 
        }
    }));

    const validEmbeddings = taskAnswersEmbeddings.filter(e => e !== null);

    if (validEmbeddings.length > 0) {
        await MongoConn.collection('ai_TaskAnswers').bulkWrite(
            validEmbeddings.map(embedding => ({
                updateOne: {
                    filter: { taskId: embedding!.taskId, taskAnswerId: embedding!.taskAnswerId },
                    update: { $set: embedding },
                    upsert: true // Upsert is still useful here in case of retries or concurrent processing nuances
                }
            }))
        );
        console.log(`Successfully wrote ${validEmbeddings.length} embeddings to DB for chunk.`);
    } else {
        console.log("No valid embeddings to write for this chunk.");
    }
    
    console.log(`Finished processing chunk of ${chunk.length} answers, now waiting 15s...`);
    await new Promise(resolve => setTimeout(resolve, 15000));
    console.log("15s delay completed for chunk.");
    return validEmbeddings;
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
  model: "gpt-5-mini-2025-08-07",
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
        return searchVectors;
    } catch (e: any) {
        console.error('Error fetching embeddings:', e);
        // Propagate the error so it can be caught by processChunk
        throw e; 
    }
}