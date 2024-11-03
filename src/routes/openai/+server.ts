import { env } from "$env/dynamic/private";
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from "@sveltejs/kit";
import { getPrompt } from "$lib/prompts";
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
    const origenConsulta = mensaje.origen || 'default';
    let prompt = getPrompt({origen: origenConsulta, promptName: "sysP_Generico", reemplazos: [{name: "NOMBRE_USUARIO", value:userData?.personalData.firstname}]});
    
    let mensajesIniciales =  [
        { 
          "role": `system`,"content": prompt
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