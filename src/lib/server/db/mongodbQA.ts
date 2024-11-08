import {  MongoClient } from 'mongodb';  
import { MONGODB_HOST_QA,  MONGODB_USERNAME, MONGODB_PASSWORD } from '$env/static/private';


const client = new MongoClient(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST_QA}/?retryWrites=true&w=majority`);
await client.connect();
const MongoDBQA = client.db('snuuper');

export { MongoDBQA };