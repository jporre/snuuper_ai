import { lucia } from "$lib/server/db/auth";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { Argon2id } from "oslo/password";
import { Bcrypt } from "oslo/password";
import { MongoDBCL } from "$lib/server/db/mongodb";
import { MongoDBMX } from "$lib/server/db/mongodbMX";

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
		const bcrypt = new Bcrypt();
		let userCl = false;
		let userMx = false;
		const existingUserCL = await MongoDBCL.collection('User').findOne({ email: email, 'accountData.role': 'admin' });
		if (existingUserCL) {
			userCl = await bcrypt.verify(existingUserCL?.password, password);
		} else {
			return new Response(JSON.stringify("Usuario o contraseña no encontrados"), {
				status: 302,
				headers: {
					Location: '/login'
				}
			});
		}
		const existingUserMX = await MongoDBMX.collection('User').findOne({ email: email, 'accountData.role': 'admin' });
		if (existingUserMX) { userMx = await bcrypt.verify(existingUserMX?.password, password); } else {
			return new Response(JSON.stringify("Usuario o contraseña no encontrados"), {
				status: 302,
				headers: {
					Location: '/login'
				}
			});
		}
		// console.log("🚀 ~ loginWithEmailAndPassword: ~ existingUserMongo:", existingUserMongo)
		if (userCl && !userMx) {
			const userId = existingUserCL._id;
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
			event.locals.country = ['CL'];
			redirect(302, '/CL/dh/tareas');
		} else if (userMx && !userCl) {
			const userId = existingUserMX._id;
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
			event.locals.country = ['MX'];
			redirect(302, '/MX/dh/tareas');
		} else if (userCl && userMx) {
			const userId = existingUserCL._id;
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
			event.locals.country = ['CL', 'MX'];
			redirect(302, '/CL/dh/tareas');
		} else {
			if (event.locals.session) {
				await lucia.invalidateSession(event.locals.session.id);
				const sessionCookie = lucia.createBlankSessionCookie();
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: ".",
					...sessionCookie.attributes
				});
			}
			redirect(302, '/login');
		}
		return new Response(JSON.stringify("Usuario o contraseña no encontrados"), {
			status: 302,
			headers: {
				Location: '/login'
			}
		});
	}
};