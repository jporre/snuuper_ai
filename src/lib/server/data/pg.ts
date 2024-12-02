import { knex_pg } from "$lib/server/db/knex_pg";
import { error } from "@sveltejs/kit";
import type { Error } from "postgres";
import type { detalleCampania } from "$lib/server/data/pgtypes"; 
import  { checkConnection } from "$lib/server/db/knex_pg";

export async function getCampanias() {
  try {
    const isValidConnection = await checkConnection();
    if (!isValidConnection) {error(500,'No se puede conectar a la base de datos');}
    return await knex_pg("ta_campania").select("*");
  } catch (e: any) {
    return error(e.message);
  }
}
export async function getCampania(id: number) {
  try {
    const isValidConnection = await checkConnection();
    if (!isValidConnection) {error(500,'No se puede conectar a la base de datos');}
    return await knex_pg("ta_campania").select("*").where({ id });
  } catch (e: any) {
    return error(e.message);
  }
}

export const getDetalleCampaniaAll = async (): Promise<detalleCampania[]> => {
  try {
    const isValidConnection = await checkConnection();
    if (!isValidConnection) {error(500,'No se puede conectar a la base de datos');}
    const results = await knex_pg('comunicaciones.ta_detalle_campania').select('*');
    return results as detalleCampania[];
  } catch (error) {
    console.error('Error fetching all campanias:', error);
    throw new Error('Could not fetch campanias');
  }
};

export const getDetalleCampaniaById = async (id: number): Promise<detalleCampania | null> => {
    const isValidConnection = await checkConnection();
    if (!isValidConnection) {error(500,'No se puede conectar a la base de datos');}
  try {
    const result = await knex_pg('comunicaciones.ta_detalle_campania').where({ id_campania: id });
    return result ? (result as detalleCampania) : null;
  } catch (error) {
    console.error(`Error fetching campania with id ${id}:`, error);
    throw new Error('Could not fetch campania');
  }
};

export const insertDetalleCampania = async (campania: Omit<detalleCampania, 'id_linea' | 'fecha_creacion'>): Promise<number> => {
  try {
    const isValidConnection = await checkConnection();
    if (!isValidConnection) {error(500,'No se puede conectar a la base de datos');}
    const [id] = await knex_pg('comunicaciones.ta_detalle_campania').insert(campania).returning('id_linea');
    return id;
  } catch (error) {
    console.error('Error inserting campania:', error);
    throw new Error('Could not insert campania');
  }
};

export const updateDetalleCampania = async (id: number, campania: Partial<detalleCampania>): Promise<number> => {
  try {
    const isValidConnection = await checkConnection();
    if (!isValidConnection) {error(500,'No se puede conectar a la base de datos');}
    const updatedRows = await knex_pg('comunicaciones.ta_detalle_campania').where({ id_linea: id }).update(campania);
    return updatedRows;
  } catch (error) {
    console.error(`Error updating campania with id ${id}:`, error);
    throw new Error('Could not update campania');
  }
};