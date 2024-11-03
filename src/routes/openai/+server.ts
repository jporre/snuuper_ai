import { env } from "$env/dynamic/private";
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from "@sveltejs/kit";
import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY ?? '',
});

export const POST: RequestHandler = async (event) => {
    const mensaje = await event.request.json();
    const userData = event.locals.user;

    if(!userData){
        redirect(404,'/login');
    }
    if(!mensaje) { error(400, 'No request data') }
    if(!mensaje.Conversation) { error(400, 'No messages provided') }
    
    try {
    const moderacion = await openai.moderations.create({
        input: mensaje.Conversation[mensaje.Conversation.length-1].content
    });
    const [results] = moderacion.results;
    if (results.flagged) {
        error(403, 'Query flagged by openai')
    }
    } catch (e: any) {
        error(e.status, e.error.message)
    }
    
    let mensajesIniciales =  [
        { 
          "role": `system`,"content": `Eres un analista de datos que trabaja en Snuuper. Snuuper es una empresa que realiza encuestas y mediciones de mercado a través de herramientas de tecnológia. Estás hablando con ${userData?.personalData.firstname} , que es cliente de snuuper y por lo mismo sólo estás autorizado a responder temas de snuuper o de la encuesta que ${userData?.personalData.firstname} està revisando`
        }
    ];
    
    const conversationLog = [...mensajesIniciales, ...mensaje.Conversation];
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: conversationLog,
        "temperature": 0.4
       });

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