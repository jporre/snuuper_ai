<script lang="ts">
	import KpiRespuestas from '$lib/components/kpiRespuestas.svelte';
	import type { PageData } from './$types';
	import { marked } from 'marked';
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
	import { getUserState } from '$lib/state.svelte';
	import { invalidate } from '$app/navigation';
	let { data }: { data: PageData } = $props();
	let mostrarCompleto = $state(false);
	function truncarTexto(texto: string, limite: number) {
		if (texto.length <= limite) return texto;
		return texto.slice(0, limite) + '...';
	}
	let rotaDetailes = $state(false);
	async function update() {
		rotaDetailes = true;
		const res = await fetch(`/api/data/PoblarStepAnswerDetails`, {
			method: 'POST',
			body: JSON.stringify({ taskId: data.taskId }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.ok) {
			invalidate('app:getTask');
			rotaDetailes = false;
		} else {
			rotaDetailes = false;
		}
	}
	let rotaSummary = $state(false);
	async function createSummary() {
		rotaSummary = true;
		const res = await fetch(`/api/data/createTaskSummary`, {
			method: 'POST',
			body: JSON.stringify({ taskId: data.taskId }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.ok) {
			invalidate('app:getTask');
			rotaSummary = false;
		} else {
			rotaSummary = false;}
	}
	let rotaReport = $state(false);
	async function creaReporte() {
		rotaReport = true;
		//const res = await fetch(`/api/data/createTaskAnswersEmbeddings`, {
			const res = await fetch(`/api/data/createTaskReport`, {
			method: 'POST',
			body: JSON.stringify({ taskId: data.taskId }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.ok) {
			rotaReport = false;
		} else {
			rotaReport = false;
		}
	}
	let rotaTest = $state(false);
	async function test() {
		rotaTest = true;
		const res = await fetch(`/api/data/createTaskAnswersEmbeddings`, {
			method: 'POST',
			body: JSON.stringify({ taskId: data.taskId }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.ok) {
			rotaTest = false;
		} else {
			rotaTest = false;
		}
	}
</script>
<div class="w-full">
	<div class="flex p-1 mx-auto bg-sky-50 border-2 border-sky-900 rounded-lg shadow-md">
		<div class="flex flex-col w-full m-2 mx-auto">
			<div role="tablist" class="tabs tabs-lifted">
				<!-- Tab controls -->
				<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Informe" checked />
				<div role="tabpanel" class="tab-content p-6">
					<div class="mx-auto max-w-7xl lg:mx-0 bg-white pl-4">
						<h2 class="text-2xl font-semibold tracking-tight text-gray-900 text-pretty ">Resume Ejecutivo</h2>
						{#if data.tarea.resumen_ejecutiva == '' || data.tarea.resumen_ejecutiva == null}
							<p class="mt-6 text-gray-600 text-sm sm:text-md">
								En este momento no hay un resumen ejecutivo para esta tarea. ¿Deseas crear uno?
								<button onclick={creaReporte} class="btn btn-sm {rotaReport ? 'animate-ping':'animate-none'}">Crear uno</button>
							</p>
						{:else}
							<p class="p-4 mt-6 text-sm text-gray-900 font-dosis bg-white rounded-md shadow-md sm:text-lg">{@html marked(data.tarea.resumen_ejecutiva ?? '')}</p>
						{/if}
						</div>
				</div>
				<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Resultados"  />
				<div role="tabpanel" class="tab-content p-6">
					<!-- Contenido del tab Resultados -->
					<div class="mx-auto max-w-7xl lg:mx-0 bg-white pl-4">
						<h2 class="text-2xl font-semibold tracking-tight text-gray-900 text-pretty ">Características de la Encuesta</h2>
						<button onclick={test} class="btn btn-circle btn-sm bg-sky-900 text-white"><RotateCcw class="w-6 h-6 {rotaTest ? 'animate-spin':'animate-none'}" /> </button>
						{#if data.tarea.definicion_ejecutiva == '' || data.tarea.definicion_ejecutiva == null}
							<p class="mt-6 text-gray-600 text-sm sm:text-md">
								En este momento no hay un resumen ejecutivo para esta tarea. ¿Deseas crear uno?
								<button onclick={createSummary} class="btn btn-sm {rotaSummary ? 'animate-ping':'animate-none'}">Crear uno</button>
							</p>
						{:else}
							<p class="p-4 mt-6 text-sm text-gray-900 font-dosis bg-white rounded-md shadow-md sm:text-lg">{@html marked(data.tarea.definicion_ejecutiva ?? '')}</p>
						{/if}
						<div class="mt-6">
							<div class="flex flex-row justify-between pr-3 mb-2">
							<h2 class="text-2xl font-semibold tracking-tight text-gray-900  text-pretty">Información Obtenida</h2>
							<button onclick={update} class="btn btn-circle btn-sm bg-sky-900 text-white"><RotateCcw class="w-6 h-6 {rotaDetailes ? 'animate-spin':'animate-none'}" /> </button>
							</div>
							{#await data.respuestas}
								<p class="mt-6 text-gray-600 text-lg/8 sm:text-base">Cargando...</p>
							{:then respuestas}
								
								<KpiRespuestas taskAnswers={respuestas} />
							{/await}
						</div>
					</div>
				</div>
				<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Tarea" />
				<div role="tabpanel" class="tab-content p-6">
					<!-- Contenido del tab Tarea -->
					<div class="mx-auto max-w-7xl lg:mx-0">
						<h2 class="text-3xl font-semibold tracking-tight text-gray-900 text-pretty sm:text-xl">{data.tarea.title}</h2>
						<p class="mt-6 text-sm text-gray-600 sm:text-base">{@html mostrarCompleto ? data.tarea.description : truncarTexto(data.tarea.description, 200)}</p>
						<button
							class="text-blue-500 hover:underline"
							onclick={(event) => {
								event.preventDefault();
								mostrarCompleto = !mostrarCompleto;
							}}>
							{mostrarCompleto ? 'Mostrar menos' : 'Mostrar más'}
						</button>
						<div class="mt-6">
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
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
