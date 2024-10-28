import { lucia } from "$lib/server/db/auth";
import { fail, redirect, type Actions } from "@sveltejs/kit";
//import { Argon2id } from "oslo/password";
import { db } from "$lib/server/db/pgcon";

//const argon2id = new Argon2id();


export const actions: Actions = {
	loginWithEmailAndPassword: async (event) => {
		// const formData = await event.request.formData();
		// const email = formData.get("email");
		// const password = formData.get("password");

		// if (typeof email !== "string" || email.length < 3 || email.length > 90) {
        //     return fail(400, {
        //         message: "Invalid email"
        //     });
        // } 
		// if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		// 	return fail(400, {
		// 		message: "Invalid password"
		// 	});
		// }

		
        // const existingUser = await knex_pg('auth_user').where('email', email).first();
		// if (!existingUser) {
		// 	// NOTE:
		// 	// Returning immediately allows malicious actors to figure out valid usernames from response times,
		// 	// allowing them to only focus on guessing passwords in brute-force attacks.
		// 	// As a preventive measure, you may want to hash passwords even for invalid usernames.
		// 	// However, valid usernames can be already be revealed with the signup page among other methods.
		// 	// It will also be much more resource intensive.
		// 	// Since protecting against this is non-trivial,
		// 	// it is crucial your implementation is protected against brute-force attacks with login throttling etc.
		// 	// If usernames are public, you may outright tell the user that the username is invalid.
		// 	return fail(400, {
		// 		message: "Incorrect username or password"
		// 	});
		// }
		// const validPassword = await argon2id.verify(existingUser?.password_hash, password);
		// if (!validPassword) {
		// 	console.log("Incorrect password");
		// 	return fail(400, {
		// 		code: 400,
		// 		message: "Incorrect username or password"
		// 	});
		// }

		// const session = await lucia.createSession(existingUser.id, {});
		// const sessionCookie = lucia.createSessionCookie(session.id);
		// event.cookies.set(sessionCookie.name, sessionCookie.value, {
		// 	path: ".",
		// 	...sessionCookie.attributes
		// });

		redirect(302, "/");
	}
};