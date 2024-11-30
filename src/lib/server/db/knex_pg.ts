import Knex from 'knex'
import { POSTGRES_HOST, POSTGRES_PORT , POSTGRES_USER, POSTGRES_DB, POSTGRES_PASSWORD} from '$env/static/private';

const knex_pg = Knex({
    client: 'pg',
  connection: {
    host : POSTGRES_HOST,
    port : Number(POSTGRES_PORT),
    user : POSTGRES_USER,
    password : POSTGRES_PASSWORD,
    database : POSTGRES_DB
  },
  searchPath: ['comunicaciones'],
  debug : false,
  pool: {
    min: 2,
    max: 10
  }
});

    /**
     * Verifica la conexión a la base de datos, realizando hasta {@link maxRetries} intentos.
     * En cada intento, se ejecuta un comando `SELECT 1` para verificar la conexión.
     * Si el intento falla, se muestra un mensaje de error en la consola, con el número de intento y el error correspondiente.
     * Si se alcanza el límite de intentos sin establecer la conexión, se muestra un mensaje de error adicional y se devuelve `false`.
     * Si se establece la conexión, se devuelve `true`.
     * @returns {Promise<boolean>} Un promise que se resuelve a un booleano indicando si se estableció la conexión.
     */
export async function checkConnection() {
    const maxRetries = 3;
    let attempt = 0;
    let isConnected = false;

    while (attempt < maxRetries) {
        try {
            const result = await knex_pg.raw('SELECT 1');
            if (result.rowCount > 0) {
                isConnected = true;
                break; // Conexión exitosa, salir del bucle
            }
        } catch (error) {
            console.error(`Intento ${attempt + 1} de ${maxRetries} fallido al verificar la conexión a la base de datos:`, error);
        }
        attempt += 1;
        if (attempt < maxRetries) {
            // Espera 1 segundo antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    if (!isConnected) {
        console.error('No se pudo establecer la conexión a la base de datos después de varios intentos.');
    }
    return isConnected;
}

export { knex_pg }
