<script lang="ts">
	import { enhance } from '$app/forms';
	import Lobby_salida_snuuper from '$lib/images/Lobby_salida_snuuper.png?enhanced';
	import type { SubmitFunction } from './$types.js';

	let error: string | null = $state('');
	let isLoggingOut: boolean = $state(false);

	const logout: SubmitFunction = () => {
		isLoggingOut = true;
		error = null;
		return async ({ update }) => {
			isLoggingOut = false;
			await update();
		};
	};
	let { data } = $props();
	console.log(data);
</script>

<div class="flex items-center justify-center min-h-screen">
	<div class="z-50 w-full max-w-md p-8 space-y-8 bg-white shadow-md opacity-80 rounded-xl">
		<div>
			<h2 class="mt-6 text-3xl font-extrabold text-center text-gray-900">Logout</h2>
			<p class="mt-2 text-lg text-center text-gray-600">Estàs seguro que quieres cerrar sessión?</p>
		</div>
		{#if error}
			<div class="relative px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
				<span class="block sm:inline">{error}</span>
			</div>
		{/if}
		<div>
			<form method="POST" action="?/logout" use:enhance={logout}>
				<button type="submit" disabled={isLoggingOut} class="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
					{#if isLoggingOut}
						<svg class="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Logging out...
					{:else}
						Cerrar Session y Salir
					{/if}
				</button>
        <a href="/dh" class="relative flex justify-center w-full px-4 py-2 mt-4 text-sm font-medium text-white border border-transparent rounded-md opacity-100 bg-emerald-600 group hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50">No ! Quiero volver</a>
			</form>
		</div>
	</div>
	<div class="absolute top-0 z-0 flex flex-col w-screen h-screen"><enhanced:img src={Lobby_salida_snuuper} class="object-cover object-center w-full min-h-screen opacity-70 grow" alt="fondo-ilustrado"></enhanced:img></div>
</div>
