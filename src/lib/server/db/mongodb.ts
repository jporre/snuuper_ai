import {  MongoClient } from 'mongodb';  
import { MONGODB_HOST,  MONGODB_USERNAME, MONGODB_PASSWORD } from '$env/static/private';


const client = new MongoClient(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}/?retryWrites=true&w=majority`);
await client.connect();
const MongoDBCL = client.db('snuuper');

export { MongoDBCL };