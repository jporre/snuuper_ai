<script lang="ts">
	import KpiRespuestas from '$lib/components/kpiRespuestas.svelte';
	import type { PageData } from './$types';
	import { marked } from 'marked';
	import Radar from 'lucide-svelte/icons/radar';
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
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
		const res = await fetch(`/gtyui6t7_lk/data/PoblarStepAnswerDetails`, {
			method: 'POST',
			body: JSON.stringify({ taskId: data.taskId, country: data.country }),
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
		const res = await fetch(`/gtyui6t7_lk/data/createTaskSummary`, {
			method: 'POST',
			body: JSON.stringify({ taskId: data.taskId, country: data.country }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.ok) {
			invalidate('app:getTask');
			rotaSummary = false;
		} else {
			rotaSummary = false;
		}
	}
	let rotaReport = $state(false);
	async function creaReporte() {
		rotaReport = true;
		//const res = await fetch(`/gtyui6t7_lk/data/createTaskAnswersEmbeddings`, {
		const res = await fetch(`/gtyui6t7_lk/data/createTaskReport`, {
			method: 'POST',
			body: JSON.stringify({ taskId: data.taskId, country: data.country }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.ok) {
			rotaReport = false;
			invalidate('app:getTask');
		} else {
			rotaReport = false;
			invalidate('app:getTask');
		}
	}
	let rotaTest = $state(false);
	async function test() {
		rotaTest = true;
		const res = await fetch(`/gtyui6t7_lk/data/createTaskAnswersEmbeddings`, {
			method: 'POST',
			body: JSON.stringify({ taskId: data.taskId, country: data.country }),
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

	import { fade } from 'svelte/transition';
    
    // Estado para controlar el modal
    let showModal = $state(false);
    let selectedImage = $state('');
    
    // Función para abrir el modal
    function openModal(imageUrl: any) {
        selectedImage = imageUrl;
        showModal = true;
        // Prevenir scroll del body cuando el modal está abierto
        document.body.style.overflow = 'hidden';
    }
    
    // Función para cerrar el modal
    function closeModal() {
        showModal = false;
        // Restaurar scroll del body
        document.body.style.overflow = 'auto';
    }
    
    // Cerrar modal al presionar ESC
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && showModal) {
            closeModal();
        }
    }
</script>

<svelte:head>
	<title>{data.tarea?.title || ''}</title>
</svelte:head>
<svelte:window on:keydown={handleKeydown}/>
<div class="w-full">
	<div class="flex p-1 mx-auto border-2 rounded-lg shadow-md bg-sky-50 border-sky-900">
		<div class="flex flex-col w-full m-2 mx-auto">
			<div class="absolute right-10 w-28">
				{#await data.company_info}
					<p class="text-gray-600 text-lg/8 sm:text-base">Cargando...</p>
				{:then company_info}
					<img src={`https://files.snuuper.com/${company_info.companyLogo}`} alt="logo empresa" class="rounded-xl" />
				{/await}
			</div>
			<div role="tablist" class=" tabs tabs-lifted">
				<!-- Tab controls -->
				<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Informe" checked />
				<div role="tabpanel" class="p-6 tab-content">
					<div class="max-w-full pl-4 mx-auto bg-right-top bg-no-repeat lg:mx-0 rounded-xl drop-shadow-md shadow-blue-900">
						<div class="flex flex-row justify-between w-full pt-2 pl-2 pr-2 rounded-lg">
							<h2 class="text-2xl font-semibold tracking-tight text-gray-900 text-pretty">Resume Ejecutivo: {data.tarea?.title || ''}</h2>
							<button onclick={creaReporte} class="flex text-white flex-end btn btn-circle btn-sm bg-sky-900"><Radar class="w-6 h-6 {rotaReport ? 'animate-spin' : 'animate-none'}" /></button>
						</div>
						{#if data.tarea.resumen_ejecutiva == '' || data.tarea.resumen_ejecutiva == null}
							<p class="mt-6 text-sm text-gray-600 sm:text-md">
								En este momento no hay un resumen ejecutivo para esta tarea. ¿Deseas crear uno?
								<button onclick={creaReporte} class="btn btn-sm {rotaReport ? 'animate-ping' : 'animate-none'}">Crear uno</button>
							</p>
						{:else}
							<p class="p-4 mt-6 text-sm text-gray-900 bg-white rounded-md shadow-md opacity-90 font-dosis sm:text-lg">{@html marked(data.tarea.resumen_ejecutiva ?? '')}</p>
						{/if}
					</div>
				</div>
				<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Resultados" />
				<div role="tabpanel" class="p-6 tab-content">
					<!-- Contenido del tab Resultados -->
					<div class="max-w-full pl-4 mx-auto bg-white lg:mx-0">
						<div class="flex flex-row justify-between w-10/12 pt-2 pl-2 pr-2">
							<h2 class="text-2xl font-semibold tracking-tight text-gray-900 text-pretty">Características de la Encuesta</h2>
							<button onclick={test} class="flex text-white flex-end btn btn-circle btn-sm bg-sky-900"><Radar class="w-6 h-6 {rotaTest ? 'animate-spin' : 'animate-none'}" /></button>
						</div>
						<button onclick={createSummary} class="btn btn-sm {rotaSummary ? 'animate-ping' : 'animate-none'}">Crear uno</button>
						{#if data.tarea.definicion_ejecutiva == '' || data.tarea.definicion_ejecutiva == null}
							<p class="mt-6 text-sm text-gray-600 sm:text-md">
								En este momento no hay un resumen ejecutivo para esta tarea. ¿Deseas crear uno?
								<button onclick={createSummary} class="btn btn-sm {rotaSummary ? 'animate-ping' : 'animate-none'}">Crear uno</button>
							</p>
						{:else}
							<p class="p-4 mt-6 text-sm text-gray-900 bg-white rounded-md shadow-md font-dosis sm:text-lg">{@html marked(data.tarea.definicion_ejecutiva ?? '')}</p>
						{/if}
						<div class="mt-6">
							<div class="flex flex-row justify-between pr-3 mb-2">
								<h2 class="text-2xl font-semibold tracking-tight text-gray-900 text-pretty">Información Obtenida</h2>
								<button onclick={update} class="text-white btn btn-circle btn-sm bg-sky-900"><RotateCcw class="w-6 h-6 {rotaDetailes ? 'animate-spin' : 'animate-none'}" /></button>
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
				<div role="tabpanel" class="p-6 tab-content">
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
				<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Respuestas" />
				<div role="tabpanel" class="p-6 tab-content">
					{#await data.taskAnswers}
						<p class="mt-6 text-gray-600 text-lg/8 sm:text-base">Cargando...</p>
					{:then Trespuestas}
						<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
							{#each Trespuestas[0].stepAnswerDetails as r}
								{#if r.tipo_paso == 'photo' && r.respuesta_cruda}
									<button 
										type="button"
										class="group overflow-hidden bg-gray-100 rounded-lg shadow-sm h-auto cursor-pointer"
										onclick={() => openModal(`https://imgtx.interno.snuuper.com/image/https://files.snuuper.com/${r.respuesta_cruda}?quality=50`)}
										onkeydown={(e) => e.key === 'Enter' && openModal(`https://imgtx.interno.snuuper.com/image/https://files.snuuper.com/${r.respuesta_cruda}?width=1200`)}
										aria-label="Ver imagen ampliada"
									>
										<div class="relative pb-[75%]">
											<img 
												src="https://imgtx.interno.snuuper.com/image/https://files.snuuper.com/{r.respuesta_cruda}?width=350" 
												alt="Foto respuesta" 
												class="absolute inset-0 w-full h-full object-contain transition-all duration-300 group-hover:scale-105" 
												loading="lazy" 
											/>
										</div>
									</button>
								{/if}
							{/each}
						</div>
					{/await}
				</div>
			</div>
		</div>
	</div>
</div>
{#if showModal}
	<div 
		class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" 
		transition:fade={{ duration: 200 }}
		onclick={closeModal}
		onkeydown={(e) => e.key === 'Escape' && closeModal()}
		role="dialog"
		aria-modal="true"
	>
		<div class="relative w-full h-full flex items-center justify-center">
			<!-- Botón de cerrar -->
			<button 
				class="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-colors"
				onclick={closeModal}
				aria-label="Cerrar"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
			
			<!-- Imagen ampliada -->
			<div class="max-h-[90vh] max-w-[90vw]">
				<img 
					src={selectedImage} 
					alt="Imagen ampliada" 
					class="h-full w-full object-contain"
					onclick={() => {}}
				/>
			</div>
        </div>
    </div>
{/if}
<style>
	h1 {
		font-size: 2rem;
		color: #1d3346;
		font-weight: bold;
	}
</style>
