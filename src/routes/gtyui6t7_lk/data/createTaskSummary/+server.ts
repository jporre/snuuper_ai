import { getActivetask, getStepDetails, getTask } from '$lib/server/data/tasks';
import { MongoDBCL } from '$lib/server/db/mongodb';
import { MongoDBQA } from '$lib/server/db/mongodbQA';
import { MongoDBMX } from '$lib/server/db/mongodbMX';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { env } from "$env/dynamic/private";
import { ObjectId } from 'mongodb';
import OpenAI from "openai";
import TurndownService from 'turndown';
const turndownService = new TurndownService();

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY ?? '',
});
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
    if (!task) { error(404, 'Task not found') }
    const taskSteps = await getStepDetails(body.taskId, country);
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
        textTarea += ` Numero: ${step.correlativeNumber + 1} de tipo ${step.type} con descripción ${step.instruction[0].data }`;
        if (step.alternatives && step.alternatives.length > 0) {
            textTarea += ` y con las siguientes alternativas:`;
            step.alternatives.forEach((alternative, i) => {
                textTarea += ` ${i + 1}: ${alternative.value}`;
            });
        }
    });
    // Ahora busco respuestas con OpenAI. 
    // let prompt0 = `Eres un analista de datos experto en experiencia de usuarios y puntos de venta, especializado en el diseño e implementación de encuestas de "Cliente Incógnito".E Tu tarea es analizar diseños de encuestas, resultados de encuestas y proporcionar un informe ejecutivo de no mas de 3 parrafos haciendo ingenieria minversa para determinar cual hubiera sido la especificación de requerimientos de la tarea.Para eso se te proporcioanra la siguiente información: ${textTarea}, recuerda que debes revisar cuidadosamente el diseño de la encuesta. Identifica los objetivos principales, la estructura de las preguntas y las áreas de enfoque.Directrices de lenguaje y tono:    - Utiliza un lenguaje coloquial y cercano, vitando ser demasiado formal o informal    - Sé amable pero conciso en tus explicaciones    - Adapta tu lenguaje al nivel de comprensión esperado de tu audiencia, evitando jerga técnica innecesaria. `;
    let prompt = `**Contexto:** La encuesta "Cliente Incógnito" para estaciones de servicio Shell y sus tiendas asociadas busca evaluar diversos aspectos de la experiencia del cliente en el sitio. Esta evaluación, diseñada para el mes de febrero de 2025, se centra en la interacción del cliente incógnito con el personal tanto de la estación de servicio como de la tienda, así como en el análisis de la limpieza y los servicios disponibles en el lugar. La tarea requiere que el participante actúe de manera discreta y siga un conjunto detallado de instrucciones para asegurar que su evaluación sea lo más objetiva y precisa posible.
**Rol:** Como experto analista de datos en experiencia de usuarios y puntos de venta con más de veinte años de experiencia, estás encargado de decodificar el diseño de esta encuesta. Se te pide reconstruir una especificación de requisitos a partir de los pasos e instrucciones provistas, enfocándote en el propósito general, los procedimientos para recolectar datos significativos y las condiciones necesarias para asegurar la validez de los resultados. **Detalles:** ${textTarea}
**Acción:**
1. Analiza los componentes primarios de la encuesta para identificar los objetivos clave, como evaluar la eficacia y amabilidad del personal, la calidad de las instalaciones, y la satisfacción general del cliente.
2. Revisa la estructura de las preguntas para entender el enfoque y las metodologías de recolección de datos, asegurando que las instrucciones sean claras y específicas para evitar discrepancias en la información recolectada.
3. Identifica y documenta las restricciones y condiciones críticas que influencian la validez de las respuestas, como la discreción del participante y la autenticidad de las evidencias fotográficas.
4. Resume las expectativas de comportamiento del cliente incógnito y las circunstancias bajo las cuales podría ser rechazado su informe.
5. Destila las mejores prácticas y lecciones aprendidas que puedan aplicarse a futuras encuestas similares para maximizar la calidad del feedback.
**Formato:** El informe se presentará en un formato de párrafo conciso, subdividido en tres partes, cada una enfocada en un aspecto específico: objetivos de la encuesta, estructura y metodología, y control de calidad.
**Audiencia Objetivo:** La especificación está dirigida a gestores y diseñadores de encuestas dentro de organizaciones que buscan mejorar la percepción del cliente y optimizar los procesos de atención al cliente en entornos retail, con un enfoque particular en estaciones de servicio y tiendas.`;
    let mensajesIniciales =  [ {  "role": `system`,"name":"openai","content": prompt } ];
    let mensaje_usuario = [{ "role": `user`,"content": `Hola ! Solamente tengo la informacin de una tarea que ya està creada, me podrías entregar la especificacion de requerimientos en forma de prosa ? estos son los datos que tengo: ${textTarea}. Quiero que uses lenguaje afirmativo y no condicional y me entregues la respuesta en formato markdown, aprovecha de resltar terminos relevantes` }];
    
    const conversationLog = [...mensajesIniciales, ...mensaje_usuario];
    const markdowntext = turndownService.turndown(prompt);
 //   console.log("🚀 ~ constPOST:RequestHandler= ~ markdowntext:", markdowntext)
    const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: conversationLog,
        "temperature": 0.4
       });
     console.log(completion.usage?.total_tokens);
    const respuestaAI = completion.choices[0].message.content;
    // ahora necensito actualizar el campo definicion_ejecutiva de la coleccion Task en Mongodb
    const updateTask = await MongoConn.collection('Task').updateOne({_id: tid}, {$set: {definicion_ejecutiva: respuestaAI}});
    
    return new Response(JSON.stringify({message: 'Task summary created', taskId: body.taskId, taskSummary: respuestaAI}), {status: 200});
};