import type { RequestHandler } from './$types';
import { env } from "$env/dynamic/private";
import OpenAI from "openai";
import { error } from '@sveltejs/kit';
import { MongoDBCL } from '$lib/server/db/mongodb'; 
import { MongoDBQA } from '$lib/server/db/mongodbQA';
const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY ?? '',
});


export const POST: RequestHandler = async (event) => {
    const payload = await event.request.json();
    if (!payload) {
        return new Response('Payload is required', { status: 400 });
    }
    const {searchString} = payload;
    if (!searchString) {
        return new Response('searchString is required', { status: 400 });
    }
    const searchVectorsObj= await getVectors(searchString);
    const searchVectors = searchVectorsObj.data[0].embedding;   
    const getKBData = await getEmbedingsFromMongo(searchVectors);
    const resultadosBusqueda = await getKBData.toArray();
    // console.log("🚀 ~ constPOST:RequestHandler= ~ getKBData:", datos)
    
    return new Response(JSON.stringify(resultadosBusqueda), { status: 200 }) ;
};

async function getVectors(searchString: string) {
    try {
        const searchVectors = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: searchString
        });
        // console.log(searchVectors);
        return searchVectors;
    } catch (e: any) {
        console.error('Error fetching embeddings:', e);
        throw error(e.status, e.message);
    }
}

async function getEmbedingsFromMongo(searchVectors: Array<number>) {
    try {
        const MongoConnect = MongoDBQA;
        const pipeline = [
            {
              $vectorSearch: {
                index: "poli_vector",
                path: "embedding",
                queryVector: searchVectors,
                numCandidates: 150,
                limit: 10
              }
            },
            {
              $project: {
                _id: 0,
                text: 1,
                loc: 1,
                score: {
                  $meta: "vectorSearchScore"
                }
              }
            }
          ]
        const resultados =  MongoConnect.collection('ai_politicas').aggregate(pipeline);  
        return resultados;
    } 
    catch (e: any) {
        console.error('Error fetching KB data:', e);
        throw error(e.status, e.message);
    }
}
