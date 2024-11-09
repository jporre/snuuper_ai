<script lang="ts">
	import KpiRespuestas from '$lib/components/kpiRespuestas.svelte';
	import type { PageData } from './$types';
	import { marked } from 'marked';
	import * as Tabs from '$lib/components/ui/tabs/index';
	import { getUserState } from '$lib/state.svelte';
	let { data }: { data: PageData } = $props();
	const user = getUserState();

	let mostrarCompleto = $state(false);

	function truncarTexto(texto: string, limite: number) {
		if (texto.length <= limite) return texto;
		return texto.slice(0, limite) + '...';
	}

	async function update() {
		const res = await fetch(`/api/data/PoblarStepAnswerDetails`, {
			method: 'POST',
			body: JSON.stringify({ taskId: data.taskId }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.ok) {
			const { data: newData } = await res.json();
			data = newData;
		}
	}

	async function createSummary() {
		const res = await fetch(`/api/data/createTaskSummary`, {
			method: 'POST',
			body: JSON.stringify({ taskId: data.taskId }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.ok) {
			const { data: newData } = await res.json();
			data = newData;
		}
	}
</script>

<div class="">
	<div class="flex py-12 mx-auto bg-blue-100 border-2 border-blue-800 rounded-lg shadow-md sm:py-12">
		<div class="flex flex-col m-2 mx-auto space-x-4">
			<Tabs.Root value="resultados" class="w-full font-poppins">
				<Tabs.List class="grid w-full grid-cols-2">
					<Tabs.Trigger value="resultados">Resultados</Tabs.Trigger>
					<Tabs.Trigger value="tarea">Tarea</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="resultados">
					<div class="p-2 mx-auto max-w-7xl lg:mx-0">
						<h2 class="text-xl font-semibold tracking-tight text-sky-900 text-pretty sm:text-3xl">Resume Ejecutivo</h2>
						{#if data.tarea.definicion_ejecutiva == '' || data.tarea.definicion_ejecutiva == null}
							<p class="mt-6 text-gray-600 text-lg/8 sm:text-base">
							<button onclick={createSummary} class="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Crear uno</button></p>
						{:else}
							<p class="p-4 mt-6 text-sm text-blue-900 bg-white rounded-md shadow-md sm:text-base ">{@html marked(data.tarea.definicion_ejecutiva ?? '')}</p>
						{/if}
					</div>
					<div class="p-2 mx-auto mt-6 max-w-7xl lg:mx-0">
						<h2 class="text-xl font-semibold tracking-tight text-gray-900 sm:text-3xl text-pretty">Respuestas</h2>
						<button onclick={update} class="text-blue-500 hover:underline">Actualizar</button>
						{#await data.respuestas}
							<p class="mt-6 text-gray-600 text-lg/8 sm:text-base">Cargando...</p>
						{:then respuestas}
							<div>Resultado de la Encuesta</div>
							<KpiRespuestas taskAnswers={respuestas} />
						{/await}
						<p class="mt-6 text-gray-600 text-lg/8 sm:text-base"></p>
					</div>
				</Tabs.Content>
				<Tabs.Content value="tarea">
					<div class="p-2 mx-auto max-w-7xl lg:mx-0">
						<h2 class="text-3xl font-semibold tracking-tight text-gray-900 text-pretty sm:text-xl">{data.tarea.title}</h2>
						<p class="mt-6 text-sm text-gray-600 sm:text-base">{@html mostrarCompleto ? data.tarea.description : truncarTexto(data.tarea.description, 200)}</p>
						<button
							class="text-blue-500 hover:underline"
							onclick={(event) => {
								event.preventDefault();
								mostrarCompleto = !mostrarCompleto;
							}}
						>
							{mostrarCompleto ? 'Mostrar menos' : 'Mostrar más'}
						</button>
					</div>
					<div class="mx-auto max-w-7xl lg:mx-0">
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
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</div>
</div>
