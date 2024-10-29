import { Collection, MongoClient, ObjectId } from 'mongodb';  
import { MONGODB_HOST, MONGODB_NAME, MONGODB_PORT, MONGODB_USERNAME, MONGODB_PASSWORD } from '$env/static/private';
import { MongodbAdapter } from '@lucia-auth/adapter-mongodb';

const client = new MongoClient(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}/?retryWrites=true&w=majority`);
await client.connect();
const db = client.db('snuuper');
const User = db.collection("User") as Collection<UserDoc>;
const Session = db.collection("Sessions") as Collection<SessionDoc>;

const adapter = new MongodbAdapter(Session, User);

interface UserDoc {
	_id: ObjectId;
	email: string;
	personalData: {
        firstname: string | null;
        lastname: string | null;
        secondlastname: string | null;
        gender: string | null;
        cellphone: string | null;
        dni: string | null;
    };
}

interface SessionDoc {
	_id: string;
	expires_at: Date;
	user_id: ObjectId;
}

export { db, adapter };