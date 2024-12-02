import { checkConnection, knex_pg } from "$lib/server/db/knex_pg";
import { format_Unix_Time } from '$lib/utils';
import type { RequestHandler } from "@sveltejs/kit";

type SendGridEvent = {
    id_envio: string;
    event: string;
    timestamp: number;
    [key: string]: any;
};
export const POST: RequestHandler = async (event) => {
    try {
        
        const reqpre = await event.request.json();
        
        const isValidConnection = await checkConnection();
	if (!isValidConnection) {
		return new Response('No se puede conectar a la base de datos', { status: 500 });
	}
        reqpre.forEach(async (req: SendGridEvent) => {
            let id_outbound = req.id_envio
            let evento = req.event;
            let fecha_hora_evento = format_Unix_Time(req.timestamp);
            const timestamp_ahora = new Date();
            await knex_pg('ta_eventos_sendgrid').insert({ id_outbound, evento, respuesta: JSON.stringify(req) }).catch((err) => console.log((err)))
            let estado_notificacion = evento.toUpperCase();
            switch (estado_notificacion) {
                case 'DROPPED':
                    await knex_pg('ta_detalle_campania').where('id_linea', id_outbound)
                        .update({
                            estado_notificacion: estado_notificacion,
                            fecha_ultimo_estado: timestamp_ahora,
                            enviado: true,
                            rechazado: true,
                            fecha_rechazo: fecha_hora_evento
                        }).catch((err: any) => console.log((err)));
                    break;
                case 'PROCESSED':
                case 'DELIVERED':
                case 'DEFERRED':
                    await knex_pg('ta_detalle_campania').where('id_linea', id_outbound)
                        .update({
                            estado_notificacion: estado_notificacion,
                            fecha_ultimo_estado: timestamp_ahora,
                            enviado: true,
                            fecha_envio: fecha_hora_evento
                        }).catch((err: any) => console.log((err)));
                    break;
                case 'BOUNCE':
                case 'BLOCKED':
                    await knex_pg('ta_detalle_campania').where('id_linea', id_outbound)
                        .update({
                            estado_notificacion: estado_notificacion,
                            fecha_ultimo_estado: timestamp_ahora,
                            enviado: true,
                            rechazado: true,
                            recibido: false
                        }).catch((err: any) => console.log((err)));
                    break;
                case 'OPEN':
                    await knex_pg('ta_detalle_campania').where('id_linea', id_outbound)
                        .update({
                            estado_notificacion: estado_notificacion,
                            fecha_ultimo_estado: timestamp_ahora,
                            enviado: true,
                            recibido: true,
                            fecha_recibido: fecha_hora_evento
                        }).catch((err: any) => console.log((err)));
                    break;
                case 'CLICK':
                    await knex_pg('ta_detalle_campania').where('id_linea', id_outbound)
                        .update({
                            estado_notificacion: estado_notificacion,
                            fecha_ultimo_estado: timestamp_ahora,
                            enviado: true,
                            rechazado: false,
                            recibido: true
                        }).catch((err: any) => console.log((err)));
                    break;
                case 'SPAMREPORT':
                case 'UNSUBSCRIBE':
                case 'GROUP_UNSUBSCRIBE':
                case 'GROUP_RESUBSCRIBE':
                    await knex_pg('ta_detalle_campania').where('id_linea', id_outbound)
                        .update({
                            estado_notificacion: estado_notificacion,
                            fecha_ultimo_estado: timestamp_ahora
                        }).catch((err: any) => console.log((err)));
                    break;
                default:
                    break;
            }
        });
        return new Response(JSON.stringify(reqpre), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers':
                    'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
            },
            status: 200
        });
    } catch (e) {
        console.error("Error processing webhook:", e);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500
        });
    }
}

function convertPublicKeyToECDSA(publicKey) {
    return PublicKey.fromPem(publicKey);
  }