import * as crypto from 'crypto';

export function generateToken() {
const header = {
  alg: 'HS256',
  typ: 'JWT'
};

// Payload (carga útil)
const payload = {
  exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expira en 1 hora
  role: 'anon' // O 'anon', 'service_role', etc.
};

// Función para codificar en Base64URL
function base64url(source: string | Record<string, unknown>): string {
  // Codificar en base64
  let encodedSource = Buffer.from(JSON.stringify(source)).toString('base64');

  // Eliminar los '=' al final
  encodedSource = encodedSource.replace(/=+$/, '');

  // Reemplazar caracteres específicos de URL
  encodedSource = encodedSource.replace(/\+/g, '-');
  encodedSource = encodedSource.replace(/\//g, '_');

  return encodedSource;
}

// Codificar el encabezado y el payload
const encodedHeader = base64url(header);
const encodedPayload = base64url(payload);

// Crear la cadena a firmar
const token = `${encodedHeader}.${encodedPayload}`;

// Firmar el token
const jwtSecret = 'dc447559-996d-4761-a306-f47a5eab1623'; // Reemplaza con tu secreto

const signature = crypto
  .createHmac('sha256', jwtSecret)
  .update(token)
  .digest('base64');

// Convertir la firma a Base64URL
const signatureBase64Url = signature
  .replace(/=+$/, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

// Token JWT completo
const signedToken = `${token}.${signatureBase64Url}`;

//console.log(signedToken);

return signedToken;

}