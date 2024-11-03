import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async (event) => {
    const params = await event.request.json();
    const mensaje = params.mensaje;
    
    const msg = typeof mensaje === 'object' ? JSON.stringify(mensaje) : mensaje;
    //console.log(msg);

    const response = await fetch(
        "https://ai.4c.cl/api/v1/prediction/98e03b96-eb56-40a5-9885-2b8972f4bccd",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({question:msg}) 
        }
    );
    const result = await response.json();
    //console.log("🚀 ~ constPOST:RequestHandler= ~ result:", result)
    return new Response(JSON.stringify(result), { status: 200 });
};