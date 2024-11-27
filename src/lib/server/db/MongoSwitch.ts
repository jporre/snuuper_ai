import {  MongoClient } from 'mongodb';  
import { MONGODB_HOST,  MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_HOSTMX, MONGODB_HOST_QA } from '$env/static/private';

const client = new MongoClient(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}/?retryWrites=true&w=majority`);
const clientMx = new MongoClient(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOSTMX}/?retryWrites=true&w=majority`);
const clientQa = new MongoClient(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST_QA}/?retryWrites=true&w=majority`);
