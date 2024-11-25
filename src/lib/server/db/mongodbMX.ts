import {  MongoClient } from 'mongodb';  
import { MONGODB_HOSTMX,  MONGODB_USERNAME, MONGODB_PASSWORD } from '$env/static/private';


const client = new MongoClient(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOSTMX}/?retryWrites=true&w=majority`);
await client.connect();
const MongoDBMX = client.db('snuuper');

export { MongoDBMX };