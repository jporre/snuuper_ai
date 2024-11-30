import { env } from "$env/dynamic/private";
import { MongoDBCL } from '$lib/server/db/mongodb'; 
import type { PageServerLoad } from "../$types";

const MongoConnect = MongoDBCL;

export const load: PageServerLoad = async (event) => {
    
    
};