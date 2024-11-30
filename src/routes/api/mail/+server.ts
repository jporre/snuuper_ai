import EmailTemplate from '$lib/templates/comunidad.html?raw';
import { SENDGRID_API_KEY } from '$env/static/private';
import type { RequestHandler } from '@sveltejs/kit';

interface Variables {
    [key: string]: string;
}
/** Función para reemplazar variables en el template */
function replaceVariables(template: string, variables: Variables): string {
    return Object.entries(variables).reduce((result, [key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        return result.replace(regex, value);
    }, template);
}
export const GET: RequestHandler = async () => {
    try {

        // Define las variables a reemplazar
        const variables: Variables = {
            nombre: 'Juan Pérez',
            // Agrega aquí más variables según sea necesario
        };
        let htmlAsText = EmailTemplate;
        // Reemplaza las variables en el template
        htmlAsText = replaceVariables(htmlAsText, variables);
        const resultado = await sendmail('manuel@snuuper.com','Manuel Toro', 'Prueba de email - comunidad', htmlAsText,2);

        return new Response(htmlAsText, {
            headers: {
                'Content-Type': 'text/html'
            }
        });
    } catch (error) {
        console.error('Error al procesar el email:', error);
        return new Response('Error al procesar el email', { status: 500 });
    }
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

    const response = await fetch(url, options).catch((err) => { return err });

    console.log(response);
    return response;
}