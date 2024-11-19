import { getActivetask, getStepDetails } from '$lib/server/data/tasks';
import { MongoDBCL } from '$lib/server/db/mongodb';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { env } from "$env/dynamic/private";
import { ObjectId } from 'mongodb';
import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY ?? '',
});

export const POST: RequestHandler = async (event) => {
    const body = await event.request.json();
    // const userData = event.locals.user;

    // if (!userData) {
    //     redirect(404, '/login');
    // }
    if (!body) { error(400, 'No request data') }
    if (!body.taskId) { error(400, 'No taskId provided') }

    const tid = ObjectId.createFromHexString(body.taskId);
    const task = await getActivetask(body.taskId);
    if (!task) { error(404, 'Task not found') }
    const taskSteps = await getStepDetails(body.taskId);
    if (!taskSteps) { error(404, 'Task steps not found') }
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
    textTarea += `La tarea tiene premios por  ${task.reward.credits} créditos, un bono pre-definido de : ${task.reward.bonus}, un reembolso de ${task.reward.refunds}, un giftcard por: ${task.reward.giftcard} y ${task.reward.experience} puntos de experiencia.`;
    // Ahora le agrego las preguntasy/o pasos de la tarea
    textTarea += `Los pasos (preguntas e instrucciones ) de la tarea son:`;
    taskSteps.forEach((step) => {
        textTarea += ` Numero: ${step.correlativeNumber + 1} de tipo ${step.type} con descripción ${step.instruction}`;
        if (step.alternatives && step.alternatives.length > 0) {
            textTarea += ` y con las siguientes alternativas:`;
            step.alternatives.forEach((alternative, i) => {
                textTarea += ` ${i + 1}: ${alternative.value}`;
            });
        }
    });
    // Ahora busco respuestas con OpenAI. 
    let prompt = `Eres un analista de datos experto en experiencia de usuarios y puntos de venta, especializado en el diseño e implementación de encuestas de "Cliente Incógnito".E Tu tarea es analizar diseños de encuestas, resultados de encuestas y proporcionar un informe ejecutivo de no mas de 3 parrafos haciendo ingenieria minversa para determinar cual hubiera sido la especificación de requerimientos de la tarea.Para eso se te proporcioanra la siguiente información: ${textTarea}, recuerda que debes revisar cuidadosamente el diseño de la encuesta. Identifica los objetivos principales, la estructura de las preguntas y las áreas de enfoque.Directrices de lenguaje y tono:    - Utiliza un lenguaje coloquial y cercano, vitando ser demasiado formal o informal    - Sé amable pero conciso en tus explicaciones    - Adapta tu lenguaje al nivel de comprensión esperado de tu audiencia, evitando jerga técnica innecesaria. `;
    let mensajesIniciales =  [ {  "role": `system`,"name":"openai","content": prompt } ];
    let mensaje_usuario = [{ "role": `user`,"content": `Hola ! Solamente tengo la informacin de una tartea que ya està creada, me podrías entregar la especificacion de requerimientos en forma de prosa ? estos son los datos que tengo: ${textTarea}. Quiero que uses lenguaje afirmativo y no condicional y me entregues la respuesta en formato markdown, aprovecha de resltar terminos relevantes` }];
    
    const conversationLog = [...mensajesIniciales, ...mensaje_usuario];

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversationLog,
        "temperature": 0.4
       });
    // console.log(completion.usage?.total_tokens);
    const respuestaAI = completion.choices[0].message.content;
    // ahora necensito actualizar el campo definicion_ejecutiva de la coleccion Task en Mongodb
    const updateTask = await MongoDBCL.collection('Task').updateOne({_id: tid}, {$set: {definicion_ejecutiva: respuestaAI}});



    
    return new Response(JSON.stringify({message: 'Task summary created', taskId: body.taskId, taskSummary: respuestaAI}), {status: 200});
};