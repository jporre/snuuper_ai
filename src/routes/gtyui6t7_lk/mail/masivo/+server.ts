import type { RequestHandler } from './$types';
import { knex_pg } from '$lib/server/db/knex_pg';
import { SENDGRID_API_KEY } from '$env/static/private';
import EmailTemplate from '$lib/templates/comunidad.html?raw';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    const batchSize = 300; // Tamaño del lote
    let hasMoreRecords = true; // Controla si hay más registros por procesar

    while (hasMoreRecords) {
        // Obtiene un lote de mensajes
        const Mensajes = await knex_pg('ta_detalle_campania')
            .select('*')
            .where("estado", 1)
            .orderBy("id_linea")
            .limit(batchSize);
console.log(Mensajes.length);
        if (Mensajes.length === 0) {
            hasMoreRecords = false; // No hay más registros
            break;
        }

        // Procesa todos los mensajes en paralelo
        await Promise.all(
            Mensajes.map(async (mensaje) => {
                const id_envio = mensaje.id_linea;
                const htmlAsText = EmailTemplate;

                try {
                    await sendmail(
                        mensaje.email,
                        mensaje.nombre_completo,
                        'Snuuper - ¡Tenemos buenas noticias!',
                        htmlAsText,
                        id_envio
                    );
                } catch (e) {
                    console.error(`Error  al enviar el email para el registro ${id_envio}:`, e.status, e);

                    // Revertir el estado del registro si hay un error
                    await knex_pg('ta_detalle_campania')
                        .where('id_linea', id_envio)
                        .update({ estado: 3, estado_notificacion: '' });
                }
            })
        );
    }

    return new Response('Procesamiento de correos completado', {
        headers: {
            'Content-Type': 'text/html',
        },
    });
};

async function sendmail(to: string, to_name: string, subject: string, html: string, id_envio: number) {
    const url = 'https://api.sendgrid.com/v3/mail/send';
    const categoria = 'comunidad';
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SENDGRID_API_KEY}` },
        body: JSON.stringify({
            "personalizations": [{ "to": [{ "email": to, "name": to_name }], "subject": subject }],
            "categories": [categoria],
            "custom_args": { "id_envio": id_envio },
            "trackingSettings": {
                "clickTracking": {
                    "enable": true,
                    "enableText": false
                },
                "openTracking": {
                    "enable": true,
                    "substitutionTag": "'%open-track%'"
                }
            },
            "content": [{ "type": "text/html", "value": html }],
            "from": { "email": "comunidad@snuuper.com", "name": "Comunidad Snuuper" },
            "reply_to": { "email": "comunidad@snuuper.com", "name": "Comunidad Snuuper" }
        })
    };
    try {
        const response = await fetch(url, options).catch((err) => { return err });
       // console.log(response.status);
        const timestamp_ahora = new Date();
        if (response.status === 202) {
            console.log(id_envio);
            try {
                await knex_pg('ta_detalle_campania').where('id_linea', id_envio).update({
                    estado: 2,
                    estado_notificacion: 'OUT',
                    enviado: true,
                    fecha_envio: timestamp_ahora
                });
            } catch (error) {
                console.log(error)
            }
            return new Response(JSON.stringify({ respuesta: "ok", mensaje: id_envio + " email enviado OK" }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
                },
                status: response.status
            });
        } else {
        //    console.log(response)
            let r = await response.json();
            console.log(r);
            error(response.status, response.statusText);
        }
    } catch (e) {
        // // console.log("🚀 ~ file: mail_send.js ~ line 172 ~ sendSms ~ error", e.message);
        await knex_pg('ta_detalle_campania').where('id_linea', id_envio).update({ estado: 0, estado_notificacion: '' }).then(() => { }).catch(err => { console.log('error al volver atras el registro: ', err); });
        error(500, "Error al enviar el email");
    }

}