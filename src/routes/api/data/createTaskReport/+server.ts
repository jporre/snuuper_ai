import { getActivetask, getStepDetails, getTaskStats } from '$lib/server/data/tasks';
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
    console.log("🚀 ~ constPOST:RequestHandler= ~ task:", task)
    if (!task) { error(404, 'Task not found') }
    const taskSteps = await getStepDetails(body.taskId);
    if (!taskSteps) { error(404, 'Task steps not found') }
    const responseStats= await getTaskStats(body.taskId)
    if (!responseStats) { error(404, 'Task stats not found') }


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
    const textEspecificcion = task.definicion_ejecutiva || '';

// preparamos las estadisticas generales
const stats = responseStats.estadisticas;
const basicStats = stats.basicStats;
const totalResponses = basicStats[0].totalResponses;
const totalCredits = basicStats[0].totalCredits;
const totalBonos = basicStats[0].totalBonos;
const averageCompletionTime = (basicStats[0].avgCompletionTime / 60).toFixed(2);
const statusDistribution = stats.statusDistribution;
const timeDistribution = stats.timeDistribution;
const multipleChoiceStats = stats.multipleChoiceStats;
const yesNoStats = stats.yesNoStats;
const priceListStats = stats.priceListStats;
const scaleStats = stats.scaleStats;
const fileStats = stats.fileStats;

const textStats = `RESULTADOS ESTADÍSTICOS

KPIs GENERALES:
- Total de Respuestas: ${totalResponses}
- Tiempo Promedio de Completación: ${averageCompletionTime} minutos
- Créditos Totales: ${totalCredits}
- Bonos Totales: ${totalBonos}

DISTRIBUCIÓN POR ESTADO:
${statusDistribution.map(status => `- ${status._id}: ${status.count} (${((status.count / totalResponses) * 100).toFixed(2)}%)`).join('\n')}

DISTRIBUCIÓN HORARIA:
${timeDistribution.map(time => `- ${time.hour}:00 hrs: ${time.count} respuestas`).join('\n')}

PREGUNTAS DE SELECCIÓN MÚLTIPLE:
${multipleChoiceStats.map(mc => `Pregunta: ${mc.pregunta}\nRespuestas:\n${Object.entries(mc.respuestas).map(([answer, count]) => `- ${answer}: ${count} respuestas (${(count / totalResponses * 100).toFixed(2)}%)`).join('\n')}`).join('\n\n')}

PREGUNTAS SÍ/NO:
${yesNoStats.map(yn => `Pregunta: ${yn.pregunta}\n- Sí: ${yn.stats.yes || 0}\n- No: ${yn.stats.no || 0}`).join('\n\n')}

ESTADÍSTICAS DE PRECIOS:
${priceListStats.length > 0 ? priceListStats.map(pl => `Pregunta: ${pl.pregunta}\n${Object.entries(pl.stats).map(([producto, stats]) => `- ${producto}:\n  * Precio Mínimo: ${stats.minimo}\n  * Precio Promedio: ${stats.promedio.toFixed(2)}\n  * Precio Máximo: ${stats.maximo}\n  * Número de Mediciones: ${stats.mediciones}`).join('\n')}`).join('\n\n') : ''}

ESTADÍSTICAS DE ESCALA:
${scaleStats.length > 0 ? scaleStats.map(scale => `Pregunta: ${scale.pregunta}\nPromedio: ${scale.stats.promedio.toFixed(2)}`).join('\n\n') : ''}

ARCHIVOS SUBIDOS:
${fileStats.map(file => `- ${file.pregunta}: ${file.stats.total} archivos`).join('\n')}`;


    // Ahora busco respuestas con OpenAI. 
    let prompt = `Eres un analista de datos experto en experiencia de usuarios y puntos de venta, especializado en el diseño e implementación de encuestas de "Cliente Incógnito".Tu tarea es analizar diseños de encuestas, resultados de encuestas y y proporcionar informes detallados, resúmenes ejecutivos con sugerencias de mejora.Para eso se te proporcionara informacion respecto al instrumento utlizado para levantar informacion, su definición inicial, sus preguntas y opciones. Se te proporcionará información de los resultados generales de la encuesta y alguna informacion de la empresa que pidió realizar la encuesta.  Recuerda que debes revisar cuidadosamente el diseño de la encuesta. Identifica los objetivos principales, la estructura de las preguntas y las áreas de enfoque. Directrices de lenguaje y tono:    - Utiliza un lenguaje coloquial y cercano, vitando ser demasiado formal o informal    - Sé amable pero conciso en tus explicaciones    - Adapta tu lenguaje al nivel de comprensión esperado de tu audiencia, evitando jerga técnica innecesaria. 
    1. Revisa cuidadosamente el diseño de la encuesta. Identifica los objetivos principales, la estructura de las preguntas y las áreas de enfoque.
    2. Analiza los resultados de la encuesta. Presta atención a patrones, tendencias y anomalías en las respuestas.
    3. Para cada pregunta de la encuesta:
    a. Calcula estadísticas relevantes (promedios, porcentajes, etc.)
    b. Identifica puntos fuertes y áreas de mejora
    c. Proporciona interpretaciones basadas en los datos

    4. Realiza un análisis global de todas las respuestas, identificando temas recurrentes y correlaciones entre diferentes aspectos de la experiencia del cliente.
    5. Genera sugerencias de mejora basadas en los hallazgos del análisis. Asegúrate de que sean específicas, accionables y relevantes para el contexto del negocio.
    Es posible que se te solicite proporcionar dos tipos de informes:
    a. Un resumen ejecutivo conciso con los hallazgos clave y recomendaciones principales
    b. Un informe detallado que incluya el análisis completo, todas las estadísticas relevantes y sugerencias de mejora exhaustivas

    Directrices de lenguaje y tono:
    - Utiliza un lenguaje coloquial y cercano, evitando ser demasiado formal o informal
    - Sé amable pero conciso en tus explicaciones
    - Adapta tu lenguaje al nivel de comprensión esperado de tu audiencia, evitando jerga técnica innecesaria 
    definicion inicial de la tarea: ${textTarea} su definición ejecutiva es: ${textEspecificcion}`;
    let mensajesIniciales =  [ {  "role": `system`,"name":"openai","content": prompt } ];
    let mensaje_usuario = [{ "role": `user`,"content": `Hola ! por favor necesito que me entregues un Informe ejecutivo para la encuesta, considerando estos resultados ${textStats}. me interesa que me sugieras preguntas y temas para explorara continuación al mirar en detalle las respuestas de este estudio  ` }];
    
    const conversationLog = [...mensajesIniciales, ...mensaje_usuario];

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversationLog,
        "temperature": 0.4
       });
    console.log(completion.usage?.total_tokens);
    const respuestaAI = completion.choices[0].message.content;
    // ahora necensito actualizar el campo definicion_ejecutiva de la coleccion Task en Mongodb
    const updateTask = await MongoDBCL.collection('Task').updateOne({_id: tid}, {$set: {resumen_ejecutiva: respuestaAI}});
    
    return new Response(JSON.stringify({message: 'Task summary created', taskId: body.taskId, taskSummary: respuestaAI}), {status: 200});
};