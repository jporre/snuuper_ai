import { env } from "$env/dynamic/private";
import { agente_concerje, agente_tarea } from "$lib/prompts";
import { getStatsText, getStepDetails, getTask } from "$lib/server/data/tasks";
import { MongoDBQA } from '$lib/server/db/mongodbQA';
import type { RequestHandler } from "@sveltejs/kit";
import { error } from '@sveltejs/kit';
import { ObjectId } from "mongodb";
import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY ?? '',
});
export const POST: RequestHandler = async (event) => {
    const mensaje = await event.request.json();
    console.log("🚀 ~ constPOST:RequestHandler= ~ mensaje:", mensaje)
    const userData = event.locals.user ;
    //if (!userData) { redirect(404, '/login'); }
    if (!mensaje) { error(400, 'No request data') }
    if (!mensaje.Conversation) { error(400, 'No messages provided') }
    const searchString: string = mensaje.Conversation[mensaje.Conversation.length - 1].content || '';
    //console.log("🚀 ~ constPOST:RequestHandler= ~ searchString:", searchString)
    try {
        const moderacion = await openai.moderations.create({
            input: searchString
        });
        const [results] = moderacion.results;
        if (results.flagged) {
            error(403, 'Query flagged by openai')
        }
    } catch (e: any) {
        error(e.status, e.error.message)
    }
    const origenConsulta = mensaje.origen || 'default';
    const country = mensaje.country || 'CL';
    let contexto = mensaje.context || {};
    let ragData = ''
    let getKBData = [];
    let prompt = '';
    const searchVectorsObj = await getVectors(mensaje.Conversation[mensaje.Conversation.length - 1].content);
    const searchVectors = searchVectorsObj.data[0].embedding;

    if (contexto?.taskId) {
        console.log("estoy en tareas");
        const origenConsultaArray = origenConsulta.split('/');
        const taskId =  String(contexto?.taskId);
        console.log("🚀 ~ constPOST:RequestHandler= ~ taskId:", taskId)
        const objectIdPattern = /^[a-f\d]{24}$/i;
        if (objectIdPattern.test(taskId)) {
            const taskData = await getTask(taskId, country);
            if (taskData) {
                let agent = await agente_tarea({ origen: origenConsulta, promptName: 'agente_tarea', reemplazos: [{ name: "NOMBRE_USUARIO", value: userData?.personalData?.firstname || 'Anonimo' }, { name: "TITULO_TAREA", value: taskData.title }, { name: "DEFINICION_EJECUTIVA", value: taskData.definicion_ejecutiva }] });
                const textStats = await getStatsText(taskId, country);
                const taskSteps = await getStepDetails(taskId, country);
                getKBData = await getTaskAnswerEmbedingsFromMongo(taskId, searchVectors, country);
                const resultadosBusqueda = getKBData;
                if (resultadosBusqueda.length > 0) {
                    const processedData = resultadosBusqueda.map((element: any) => ({
                        analisis: element.analisis,
                        coordinates: element.taskAnswers?.geolocation?.position?.coordinates,
                        nameAddress: element.address?.[0]?.nameAddress
                    }));
                    ragData = JSON.stringify(processedData);
                }

                let textTarea = `Los pasos (preguntas e instrucciones ) de la tarea son:`;
                taskSteps.forEach((step) => {
                    textTarea += ` Numero: ${step.correlativeNumber + 1} de tipo ${step.type} con descripción ${step.instructionShort}`;
                    if (step.alternatives && step.alternatives.length > 0) {
                        textTarea += ` y con las siguientes alternativas:`;
                        step.alternatives.forEach((alternative, i) => {
                            textTarea += ` ${i + 1}: ${alternative.value}`;
                        });
                    }
                    prompt = agent + `Las estadisticas generales, acumuladas de las respuestas son ${textStats} \n La tarea tiene pasos y preguntas, ${textTarea}.  \nEn base a la pregunta del usuario, estas son respuestas que puede considerar relevantes para responder: ${ragData}`;
                });
               // console.log("🚀 ~ taskSteps.forEach ~ prompt:", prompt)
            }
        }
    } else {
        try {
            // este es el caso por defecto
            prompt = await agente_concerje({ origen: origenConsulta, promptName: 'agente_concerje', reemplazos: [{ name: "NOMBRE_USUARIO", value: userData?.personalData?.firstname || 'Anonimo' }] });
        } catch (e: any) {
            console.error('Error fetching KB data:', e);
            throw error(e.status, e.message);
        }
    }
    let mensajesIniciales = [{ "role": `system`, "content": prompt , timestamp: new Date()}];
    const conversationLog = [...mensajesIniciales, ...mensaje.Conversation];
    const completionResponse = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: conversationLog,
        temperature: 0.4,
        stream: true,
    });
    const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    };
    const stream = new ReadableStream({
        async start(controller) {
            for await (const chunk of completionResponse) {
                controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`);
            }
            controller.close();
        }
    });
    return new Response(stream, { headers });
};
async function getVectors(searchString: string) {
    try {
        const searchVectors = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: searchString
        });
        return searchVectors;
    } catch (e: any) {
        console.error('Error fetching embeddings:', e);
        throw error(e.status, e.message);
    }
}
async function getEmbedingsFromMongo(searchVectors: Array<number>) {
    try {
        const MongoConnect = MongoDBQA;
        const pipeline = [
            {
                $vectorSearch: {
                    index: "poli_vector",
                    path: "embedding",
                    queryVector: searchVectors,
                    numCandidates: 150,
                    limit: 10
                }
            },
            {
                $project: {
                    _id: 0,
                    text: 1,
                    loc: 1,
                    score: {
                        $meta: "vectorSearchScore"
                    }
                }
            }
        ]
        const resultados = await MongoConnect.collection('ai_politicas').aggregate(pipeline).toArray();
        if (!resultados) return [];
        if (resultados.length === 0) return [];
        return resultados;
    }
    catch (e: any) {
        console.error('Error fetching KB data:', e);
        throw error(e.status, e.message);
    }
}
async function getTaskAnswerEmbedingsFromMongo(taskId: string, searchVectors: Array<number>, country: string) {
    const tid = ObjectId.createFromHexString(taskId);
    try {
        const MongoConnect = MongoDBQA;
        const pipeline = [
            {
                $vectorSearch: {
                    index: "vector_analisis",
                    path: "analisisEmbedding",
                    queryVector: searchVectors,
                    numCandidates: 100,
                    limit: 30
                }
            },
            {
                $match: {
                    taskId: tid
                }
            }
        ]
        const resultados = await MongoConnect.collection('ai_TaskAnswers').aggregate(pipeline).toArray();
        if (!resultados) return [];
        if (resultados.length === 0) return [];
        return resultados;
    }
    catch (e: any) {
        console.error('Error fetching KB data:', e);
        throw error(e.status, e.message);
    }
}
