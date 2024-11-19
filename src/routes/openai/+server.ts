import { env } from "$env/dynamic/private";
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from "@sveltejs/kit";
import { getPrompt } from "$lib/prompts";
import { MongoDBQA } from '$lib/server/db/mongodbQA';
import OpenAI from "openai";
import { getStepDetails, getTask } from "$lib/server/data/tasks";
import { ObjectId } from "mongodb";
const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY ?? '',
});
export const POST: RequestHandler = async (event) => {
    const mensaje = await event.request.json();
    const userData = event.locals.user;
    if (!userData) { redirect(404, '/login'); }
    if (!mensaje) { error(400, 'No request data') }
    if (!mensaje.Conversation) { error(400, 'No messages provided') }
    const searchString: string = mensaje.Conversation[mensaje.Conversation.length - 1].content || '';
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
    let ragData = ''
    // Todo COnvertir esta llamada en un tool que se pueda reutilizar y sea llamamdo solamente si se necesita consultra las politicas
    const searchVectorsObj = await getVectors(mensaje.Conversation[mensaje.Conversation.length - 1].content);
    const searchVectors = searchVectorsObj.data[0].embedding;
    let getKBData = {};
    let prompt = '';
    if (origenConsulta.startsWith('/dh/tareas/')) {
        console.log("estoy en tareas");
        // tengo que intentar seprar origenConsulta para obtener el id de tarea desde la que se esta consultando
        const origenConsultaArray = origenConsulta.split('/');
        const taskId = origenConsultaArray[origenConsultaArray.length - 1];
        // ahora valido el id_tarea en forma
        const objectIdPattern = /^[a-f\d]{24}$/i;
        if (objectIdPattern.test(taskId)) {
            const taskData = await getTask(taskId);
            if (taskData) {
                const taskSteps = await getStepDetails(taskId);
                getKBData = await getTaskAnswerEmbedingsFromMongo(taskId, searchVectors);
                //console.log("🚀 ~ constPOST:RequestHandler= ~ getKBData:", getKBData)
                const resultadosBusqueda = await getKBData.toArray();
                if (resultadosBusqueda.length > 0) {
                    // resultadosBusqueda es un array de objetos json con los resultados de la busqueda, por lo que ahora tenemos que unir los elemntos text de cada objeto en un solo string
                    ragData = resultadosBusqueda.map((element: any) => element.markdown).join(' ');
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
                    prompt = `Eres un consultor experto en análisis de datos y experiencia de usuario. Estás hablando con ${userData?.personalData.firstname}, que es un cliente de Snuuper. Como consultor, estás autorizado a responder preguntas relacionadas con la tarea ${taskData.title} con descripción ${taskData.definicion_ejecutiva} o temas de snuuper. La tarea tiene pasos y preguntas, ${textTarea}.  Aquí tiene información relevante de respuestas individuales a las preguntas, puedes utilizar la siguiente información: ${ragData}`;
                });
                    console.log("🚀 ~ taskSteps.forEach ~ prompt:", prompt)
            }
        }
    } else {
        try {
            //console.log("🚀 ~ constPOST:RequestHandler= ~ searchVectors:", searchVectors)
            const resultadosBusqueda = await getKBData.toArray();
            if (resultadosBusqueda.length > 0) {
                // resultadosBusqueda es un array de objetos json con los resultados de la busqueda, por lo que ahora tenemos que unir los elemntos text de cada objeto en un solo string
                ragData = resultadosBusqueda.map((element: any) => element.text).join(' ');
            }
            getKBData = await getEmbedingsFromMongo(searchVectors);
            prompt = getPrompt({ origen: origenConsulta, promptName: "sysP_Generico", reemplazos: [{ name: "NOMBRE_USUARIO", value: userData?.personalData.firstname }, { name: "CONTEXTO", value: ragData }] });
        } catch (e: any) {
            console.error('Error fetching KB data:', e);
            throw error(e.status, e.message);
        }
    }

    
    let mensajesIniciales = [{ "role": `system`, "content": prompt }];
    const conversationLog = [...mensajesIniciales, ...mensaje.Conversation];
    const completionResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversationLog,
        temperature: 0.4,
        stream: true,
    });
    const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    };
    // const result = await completion.choices[0].message;
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
        // write the search vectors to a file
        
        // console.log(searchVectors);
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
                    index: "poli_vector", // nombre del indice
                    path: "embedding", // nombre del campo que contiene los embedings
                    queryVector: searchVectors, // Texto de busqueda en la forma de vectores
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
        const resultados = MongoConnect.collection('ai_politicas').aggregate(pipeline);
        return resultados;
    }
    catch (e: any) {
        console.error('Error fetching KB data:', e);
        throw error(e.status, e.message);
    }
}
async function getTaskAnswerEmbedingsFromMongo(taskId: string, searchVectors: Array<number>) {
    const tid = ObjectId.createFromHexString(taskId);
    try {
        const MongoConnect = MongoDBQA;
        const pipeline = [
            
              {
                $vectorSearch: {
                  index: "vector_respuestas", // nombre del indice
                  path: "markdownEmbedding", // nombre del campo que contiene los embedings
                  queryVector: searchVectors, // Texto de busqueda en la forma de vectores
                  numCandidates: 150,
                  limit: 10
                }
              },
              {
                $match: {
                  taskId: tid
                }
              }
              
        ]
        const resultados = MongoConnect.collection('ai_TaskAnswers').aggregate(pipeline);
        return resultados;
    }
    catch (e: any) {
        console.error('Error fetching KB data:', e);
        throw error(e.status, e.message);
    }
}
