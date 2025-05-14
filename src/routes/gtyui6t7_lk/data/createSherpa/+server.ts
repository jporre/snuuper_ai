import { getTask, getCompanyInfo, getStepDetails, getTaskStats } from '$lib/server/data/tasks';
import { MongoDBCL } from '$lib/server/db/mongodb';
import { MongoDBQA } from '$lib/server/db/mongodbQA';
import { MongoDBMX } from '$lib/server/db/mongodbMX';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { env } from "$env/dynamic/private";
import { ObjectId } from 'mongodb';
import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY ?? '',
});
import { GoogleGenAI } from '@google/genai';
const googleai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

let MongoConn = MongoDBMX;
export const POST: RequestHandler = async (event) => {
    const body = await event.request.json();
    // const userData = event.locals.user;

    // if (!userData) {
    //     redirect(404, '/login');
    // }
    if (!body) { error(400, 'No request data') }
    if (!body.taskId) { error(400, 'No taskId provided') }
    const country = body.country;
        if(country === 'MX') { MongoConn = MongoDBMX;  } else  { MongoConn = MongoDBCL; }

    const tid = ObjectId.createFromHexString(body.taskId);
    const task = await getTask(body.taskId, country);
    //console.log("🚀 ~ constPOST:RequestHandler= ~ task:", task)
    if (!task) { error(404, 'Task not found') }
    const taskSteps = await getStepDetails(body.taskId, country);
    if (!taskSteps) { error(404, 'Task steps not found') }
    const companyId = task.constraints?.companyId[0].toString() ?? '';
    const company_info = await getCompanyInfo(companyId, country);
    if (!company_info) { error(404, 'Company info not found') }
    // Obtenemos los datos mas relevantes de la tarea para pasarselo a AI.
    let textTarea = `la tarea ${task.title} de tipo ${task.type} con descripción ${task.description} y con un tiempo de finalización de ${task.constraints.completionTime} minutos`;
    if (task.companyObj && task.companyObj.length > 0) {
        // agregar el nombre de la empresa para todas las empresas que esten en el array
        task.companyObj.forEach((company) => {
            textTarea += ` de la empresa ${company.name}`;
        });
    }
    if (task.addressObj && task.addressObj.length > 0) {
        // agregar la dirección de la empresa para todas las empresas que esten en el array
        task.addressObj.forEach((address) => {
            textTarea += ` en la dirección ${address.nameAddress}, ${address.geolocation.displayAddress},`;
        });
    }
    
    // Ahora le agrego las preguntasy/o pasos de la tarea
    textTarea += `Los pasos (preguntas e instrucciones ) de la tarea son:`;
    taskSteps.forEach((step) => {
        textTarea += ` Numero: ${step.correlativeNumber + 1} de tipo ${step.type} con descripción ${step.instruction[0].data}`;
        if (step.alternatives && step.alternatives.length > 0) {
            textTarea += ` y con las siguientes alternativas:`;
            step.alternatives.forEach((alternative, i) => {
                textTarea += ` ${i + 1}: ${alternative.value}`;
            });
        }
    });
    


    // Ahora busco respuestas con OpenAI. 
    let SystemPrompt = `Necesito que actúes como un experto en el  análisis de comportamiento de clientes, NPS, atención de público en restaurantes. 
    Trabajas en *datos de la empresa*${company_info?.company_summary || ''}*datos de la empresa* y sabes que se realizará la siguiente encuesta 
    *Datos de la encuesta* 
    ${textTarea}
    *Datos de la encuesta*. 
    `;
   
    let contents = [{ role: `user`,parts: [ { text: "Tú misión es  asegurarte de analizar muy bien la encuesta y  sus preguntas para hacer un manual de instrucciones que permita hacer un correcto análisis de las respuestas a esta encuesta. Este manual será entregado sin que puedas aclarar conceptos o responder preguntas, por lo que tus instrucciones deben ser claras, considerar los Pilares que se deben analizar, que buscar en las respuestas, y en general los elementos para que una persona sin experiencia pueda obtener resultados excepcionales." }]}];


    const config = {responseMimeType: 'text/plain', systemInstruction: [ { text: SystemPrompt} ] }
    const model = 'gemini-2.5-pro-preview-05-06';
    const response = await googleai.models.generateContent({
        model,
        config,
        contents,
      });
    console.log("🚀 ~ constPOST:RequestHandler= ~ response:", response)

    // const completion  = await openai.chat.completions.create({
    //     model: "gpt-4o-mini",
    //     messages: conversationLog,
    //     "temperature": 0.4
    //    });
    // // console.log(completion.usage?.total_tokens);
    // const respuestaAI = completion.choices[0].message.content;
    // // ahora necensito actualizar el campo definicion_ejecutiva de la coleccion Task en Mongodb
    // const updateTask = await MongoConn.collection('Task').updateOne({_id: tid}, {$set: {manual_ai: respuestaAI}});
    
    return new Response(JSON.stringify({message: 'Task summary created', taskId: body.taskId, taskSummary: 'respuestaAI'}), {status: 200});
};