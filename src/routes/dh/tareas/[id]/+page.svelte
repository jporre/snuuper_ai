<script lang="ts">
	import type { PageData } from './$types';

	import { getUserState } from '$lib/state.svelte';
	let { data }: { data: PageData } = $props();
	const user = getUserState();
</script>

<div class="w-11/12">
	<div class="flex py-12 mx-auto border-2 border-blue-800 sm:py-12 bg-slate-200">
		<div class="flex flex-row px-6 mx-auto space-x-2 lg:px-8">
			<div class="max-w-4xl mx-auto lg:mx-0">
				<h2 class="text-4xl font-semibold tracking-tight text-gray-900 text-pretty sm:text-5xl">{data.tarea.title}</h2>
				<p class="mt-6 text-gray-600 text-lg/8">{@html data.tarea.description}</p>
			</div>
			<div class="max-w-4xl mx-auto lg:mx-0">
				<h2 class="text-4xl font-semibold tracking-tight text-gray-900 text-pretty sm:text-5xl">Resume Ejecutivo</h2>
				<p class="mt-6 text-gray-600 text-lg/8">{data.tarea.definicion_ejecutiva ?? 'No hay definicion Ejecjutiva para esta Tarea'}</p>
			</div>
		</div>
	</div>
</div>
