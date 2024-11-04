<script lang="ts">
	import type { PageData } from './$types';
	import { marked } from 'marked';

	import { getUserState } from '$lib/state.svelte';
	let { data }: { data: PageData } = $props();
	const user = getUserState();
</script>

<div class="">
	<div class="flex py-12 mx-auto border-2 border-blue-800 rounded-lg shadow-md sm:py-12 bg-slate-200">
		<div class="flex flex-col mx-auto space-x-4">
			<div class="flex flex-row p-6 m-2 mx-auto space-x-2 border-2 border-blue-900 justify-evenly lg:px-8 rounded-xl">
				<div class="max-w-4xl mx-auto lg:mx-0">
					<h2 class="text-3xl font-semibold tracking-tight text-gray-900 text-pretty sm:text-xl">{data.tarea.title}</h2>
					<p class="mt-6 text-gray-600 text-lg/8 sm:text-base">{@html data.tarea.description}</p>
				</div>
				<div class="max-w-4xl mx-auto lg:mx-0">
					<h2 class="text-3xl font-semibold tracking-tight text-gray-900 text-pretty sm:text-xl">Resume Ejecutivo</h2>
					<p class="mt-6 text-gray-600 text-lg/8 sm:text-base">{@html marked(data.tarea.definicion_ejecutiva) ?? 'No hay definicion Ejecjutiva para esta Tarea'}</p>
				</div>
			</div>
			<div class="flex flex-row justify-between px-6 mx-auto mt-4 space-x-2 lg:px-8">
				<div class="max-w-2xl mx-auto lg:mx-0">
					<h2 class="text-3xl font-semibold tracking-tight text-gray-900 text-pretty sm:text-xl">Preguntas:</h2>
					{#await data.pasos}
						<div class="text-gray-600 text-lg/8 sm:text-base">Cargando...</div>
					{:then pasos}
						<div class="space-y-6">
							{#each pasos as ans}
								<div class="overflow-hidden bg-white rounded-lg shadow-md">
									<div class="grid grid-cols-5 gap-4">
										<div class="col-span-5 p-4">
											<span class="text-sm">Numero: {ans.correlativeNumber + 1} de tipo {ans.type}</span>
											<h2 class="mb-2 text-base font-normal">{@html ans.instruction[0].data || ''}</h2>
											{#if ans.alternatives && ans.alternatives.length > 0}
												<span class="text-sm">Alternativas:</span>
												<ul class="mt-2 ml-5 text-gray-700 list-disc">
													{#each ans.alternatives as alternativa, i}
														<li>{i + 1}: {alternativa.value}</li>
													{/each}
												</ul>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/await}
				</div>
				<div class="max-w-4xl mx-auto lg:mx-0">
					<h2 class="text-3xl font-semibold tracking-tight text-gray-900 text-pretty sm:text-xl">Respuestas</h2>
					{#await data.respuestas}
						<p class="mt-6 text-gray-600 text-lg/8 sm:text-base">Cargando...</p>
					{:then respuestas} 
						<div>Se presentan {respuestas.length} respuestas</div>
					{/await}
					<p class="mt-6 text-gray-600 text-lg/8 sm:text-base"></p>
				</div>
			</div>
		</div>
	</div>
</div>
