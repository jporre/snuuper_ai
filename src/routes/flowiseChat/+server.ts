import type { RequestHandler } from "@sveltejs/kit";
import pkg from 'flowise-sdk';
	const {FlowiseClient} = pkg;
export const POST: RequestHandler = async (event) => {
    const mensaje = await event.request.json();
    console.log("🚀 ~ constPOST:RequestHandler= ~ mensaje:", mensaje)
    const userData = event.locals.user;
    
    //const msg = typeof mensaje === 'object' ? JSON.stringify(mensaje) : mensaje;
    //console.log(msg);
    const input= mensaje.Conversation[mensaje.Conversation.length-1].content
    // console.log("🚀 ~ constPOST:RequestHandler= ~ input:", input)
    const client = new FlowiseClient({ baseUrl: 'https://ai.4c.cl' });
    try {
        // For streaming prediction
        const prediction = await client.createPrediction({
          chatflowId: '98e03b96-eb56-40a5-9885-2b8972f4bccd',
          question: 'Hola, como estas ?',
          streaming: true,
        });
        const headers = {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        };
        
        // const result = await completion.choices[0].message;
       
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of prediction) {
                    controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`);
                }
                controller.close();
            }
        });
    
        return new Response(stream, { headers });
        
      } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({error}), { status:500});
      }
    // const response = await fetch(
    //     "https://ai.4c.cl/api/v1/prediction/98e03b96-eb56-40a5-9885-2b8972f4bccd",
    //     {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify({question:msg}) 
    //     }
    // );
    // const result = await response.json();
    // ("🚀 ~ constPOST:RequestHandler= ~ result:", result)
    // return new Response(JSON.stringify(result), { status: 200 });
};