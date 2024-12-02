import { knex_pg } from "$lib/server/db/knex_pg";
import { error } from "@sveltejs/kit";
import type { Error } from "postgres";

export async function getCampanias() {
  try {
    return await knex_pg("ta_campania").select("*");
  } catch (e: any) {
    return error(e.message);
  }
}