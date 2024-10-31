import { lucia } from "$lib/server/db/auth";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { Argon2id } from "oslo/password";
import { Bcrypt } from "oslo/password";
import { MongoDBCL } from "$lib/server/db/mongodb";

const argon2id = new Argon2id();

export const actions: Actions = {
	loginWithEmailAndPassword: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get("email");
		const password = formData.get("password");

		if (typeof email !== "string" || email.length < 3 || email.length > 90) {
            return fail(400, {
				code: 400,
                message: "Invalid email"
            });
        } 
		if (typeof password !== "string" || password.length < 6 || password.length > 255) {
			return fail(400, {
				code: 400,
				message: "Invalid password"
			});
		}
		const existingUserMongo = await MongoDBCL.collection('User').findOne({ email: email });
		console.log("🚀 ~ loginWithEmailAndPassword: ~ existingUserMongo:", existingUserMongo)
		
		if (!existingUserMongo) {
			return fail(400, {
				code: 400,
				message: "Incorrect username or password"
			});
		}
		const bcrypt = new Bcrypt();

		//const validPassword = await argon2id.verify(existingUser.password, password);
		const validPasswordBcrypt = await bcrypt.verify(existingUserMongo?.password, password);
		console.log("🚀 ~ loginWithEmailAndPassword: ~ validPasswordBcrypt:", validPasswordBcrypt)
		

		if (!validPasswordBcrypt) {
			console.log("Incorrect password");
			return fail(400, {
				code: 400,
				message: "Incorrect username or password"
			});
		}

		const userId = existingUserMongo._id;
		console.log("🚀 ~ loginWithEmailAndPassword: ~ userID:", userId)

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});

		redirect(302, "/dh");
	}
};