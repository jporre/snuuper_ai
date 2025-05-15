<script lang="ts">
  import { invalidate } from '$app/navigation'
  import KpiRespuestas from '$lib/components/kpiRespuestas.svelte'
  import * as Tabs from "$lib/components/ui/tabs/index.js"
  import Radar from 'lucide-svelte/icons/radar'
  import RotateCcw from 'lucide-svelte/icons/rotate-ccw'
  import { marked } from 'marked'
  import type { PageData } from './$types'
  let { data }: { data: PageData } = $props()
  let mostrarCompleto = $state(false)
  function truncarTexto(texto: string, limite: number) {
    if (texto.length <= limite) return texto
    return texto.slice(0, limite) + '...'
  }
  let rotaDetailes = $state(false)
  async function update() {
    rotaDetailes = true
    const res = await fetch(`/gtyui6t7_lk/data/PoblarStepAnswerDetails`, { method: 'POST', body: JSON.stringify({ taskId: data.taskId, country: data.country }), headers: { 'Content-Type': 'application/json' } })
    if (res.ok) {
      invalidate('app:getTask')
      rotaDetailes = false
    } else {
      rotaDetailes = false
    }
  }
  let rotaSummary = $state(false)
  async function createSummary() {
    rotaSummary = true
    const res = await fetch(`/gtyui6t7_lk/data/createTaskSummary`, { method: 'POST', body: JSON.stringify({ taskId: data.taskId, country: data.country }), headers: { 'Content-Type': 'application/json' } })
    if (res.ok) {
      invalidate('app:getTask')
      rotaSummary = false
    } else {
      rotaSummary = false
    }
  }
  let rotaReport = $state(false)
  async function creaReporte() {
    rotaReport = true
    //const res = await fetch(`/gtyui6t7_lk/data/createTaskAnswersEmbeddings`, {
    const res = await fetch(`/gtyui6t7_lk/data/createTaskReport`, { method: 'POST', body: JSON.stringify({ taskId: data.taskId, country: data.country }), headers: { 'Content-Type': 'application/json' } })
    if (res.ok) {
      rotaReport = false
      invalidate('app:getTask')
    } else {
      rotaReport = false
      invalidate('app:getTask')
    }
  }
  let rotaTest = $state(false)
  async function test() {
    rotaTest = true
    const res = await fetch(`/gtyui6t7_lk/data/createTaskEmbedingV2`, { method: 'POST', body: JSON.stringify({ taskId: data.taskId, country: data.country }), headers: { 'Content-Type': 'application/json' } })
    if (res.ok) {
      rotaTest = false
    } else {
      rotaTest = false
    }
  }
  let rotaSherpa = $state(false)
  async function createSherpa() {
    rotaSherpa = true
    const res = await fetch(`/gtyui6t7_lk/data/createSherpa`, { method: 'POST', body: JSON.stringify({ taskId: data.taskId, country: data.country }), headers: { 'Content-Type': 'application/json' } })
    if (res.ok) {
      rotaSherpa = false
    } else {
      rotaSherpa = false
    }
  }

  import Button from '$lib/components/ui/button/button.svelte'
  import { Disc3 } from 'lucide-svelte'
  import { fade } from 'svelte/transition'

  // Estado para controlar el modal
  let showModal = $state(false)
  let selectedImage = $state('')

  // Función para abrir el modal
  function openModal(imageUrl: any) {
    selectedImage = imageUrl
    showModal = true
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden'
  }

  // Función para cerrar el modal
  function closeModal() {
    showModal = false
    // Restaurar scroll del body
    document.body.style.overflow = 'auto'
  }

  // Cerrar modal al presionar ESC
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showModal) {
      closeModal()
    }
  }
</script>

<svelte:head>
  <title>{data.tarea?.title || ''}</title>
</svelte:head>
<svelte:window on:keydown={handleKeydown} />
<div class="w-full">
  <div class="flex p-1 mx-auto border-2 rounded-lg shadow-md bg-sky-50 dark:bg-slate-800 border-sky-900 dark:border-sky-700">
    <div class="flex flex-col w-full m-2 mx-auto">
      <div class="absolute right-10 w-28">
        {#await data.company_info}
          <p class="text-gray-600 dark:text-gray-300 text-lg/8 sm:text-base">Cargando...</p>
        {:then company_info}
          <img src={`https://files.snuuper.com/${company_info.companyLogo}`} alt="logo empresa" class="rounded-xl" />
        {/await}
      </div>
      <Tabs.Root value="informe" class="w-full">
        <Tabs.List class="flex border-b border-gray-200 dark:border-gray-700">
          <Tabs.Trigger value="informe" class="px-4 py-2 -mb-px font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-sky-600 hover:border-sky-500 dark:hover:text-sky-400 dark:hover:border-sky-400 data-[state=active]:text-sky-700 data-[state=active]:border-sky-600 dark:data-[state=active]:text-sky-300 dark:data-[state=active]:border-sky-400" aria-label="Informe">Informe</Tabs.Trigger>
          <Tabs.Trigger value="resultados" class="px-4 py-2 -mb-px font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-sky-600 hover:border-sky-500 dark:hover:text-sky-400 dark:hover:border-sky-400 data-[state=active]:text-sky-700 data-[state=active]:border-sky-600 dark:data-[state=active]:text-sky-300 dark:data-[state=active]:border-sky-400" aria-label="Resultados">Resultados</Tabs.Trigger>
          <Tabs.Trigger value="tarea" class="px-4 py-2 -mb-px font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-sky-600 hover:border-sky-500 dark:hover:text-sky-400 dark:hover:border-sky-400 data-[state=active]:text-sky-700 data-[state=active]:border-sky-600 dark:data-[state=active]:text-sky-300 dark:data-[state=active]:border-sky-400" aria-label="Tarea">Tarea</Tabs.Trigger>
          <Tabs.Trigger value="respuestas" class="px-4 py-2 -mb-px font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-sky-600 hover:border-sky-500 dark:hover:text-sky-400 dark:hover:border-sky-400 data-[state=active]:text-sky-700 data-[state=active]:border-sky-600 dark:data-[state=active]:text-sky-300 dark:data-[state=active]:border-sky-400" aria-label="Respuestas">Respuestas</Tabs.Trigger>
          <Tabs.Trigger value="manual" class="px-4 py-2 -mb-px font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-sky-600 hover:border-sky-500 dark:hover:text-sky-400 dark:hover:border-sky-400 data-[state=active]:text-sky-700 data-[state=active]:border-sky-600 dark:data-[state=active]:text-sky-300 dark:data-[state=active]:border-sky-400" aria-label="Sherpa IA">Sherpa IA</Tabs.Trigger>
          <Tabs.Trigger value="op" class="px-4 py-2 -mb-px font-medium text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-sky-600 hover:border-sky-500 dark:hover:text-sky-400 dark:hover:border-sky-400 data-[state=active]:text-sky-700 data-[state=active]:border-sky-600 dark:data-[state=active]:text-sky-300 dark:data-[state=active]:border-sky-400" aria-label="Operacional">OP</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="informe" class="p-6">
          <div class="max-w-full pl-4 mx-auto bg-right-top bg-no-repeat lg:mx-0 rounded-xl drop-shadow-md dark:drop-shadow-lg shadow-blue-900 dark:shadow-blue-700">
            <div class="flex flex-row justify-between w-full pt-2 pl-2 pr-2 rounded-lg">
              <h2 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 text-pretty">Resume Ejecutivo: {data.tarea?.title || ''}</h2>
              <button onclick={creaReporte} class="flex items-center justify-center p-2 text-white rounded-full bg-sky-900 dark:bg-sky-700 hover:bg-sky-800 dark:hover:bg-sky-600"><Radar class="w-6 h-6 {rotaReport ? 'animate-spin' : 'animate-none'}" /></button>
            </div>
            {#if data.tarea.resumen_ejecutiva == '' || data.tarea.resumen_ejecutiva == null}
              <p class="mt-6 text-sm text-gray-600 dark:text-gray-300 sm:text-md">
                En este momento no hay un resumen ejecutivo para esta tarea. ¿Deseas crear uno?
                <button onclick={creaReporte} class="px-3 py-1 text-sm text-white rounded bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 {rotaReport ? 'animate-ping' : 'animate-none'}">Crear uno</button>
              </p>
            {:else}
              <p class="p-4 mt-6 text-sm text-gray-900 bg-white rounded-md shadow-md dark:bg-slate-900 dark:text-gray-200 opacity-90 font-dosis sm:text-lg">{@html marked(data.tarea.resumen_ejecutiva ?? '')}</p>
            {/if}
          </div>
        </Tabs.Content>
        <Tabs.Content value="resultados" class="p-6">
          <!-- Contenido del tab Resultados -->
          <div class="max-w-full pl-4 mx-auto bg-white dark:bg-slate-900 lg:mx-0">
            <div class="flex flex-row justify-between w-10/12 pt-2 pl-2 pr-2">
              <h2 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 text-pretty">Características de la Encuesta</h2>
              <button onclick={test} class="flex items-center justify-center p-2 text-white rounded-full bg-sky-900 dark:bg-sky-700 hover:bg-sky-800 dark:hover:bg-sky-600"><Radar class="w-6 h-6 {rotaTest ? 'animate-spin' : 'animate-none'}" /></button>
            </div>
            <button onclick={createSummary} class="px-3 py-1 mt-4 text-sm text-white rounded bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 {rotaSummary ? 'animate-ping' : 'animate-none'}">Crear uno</button>
            {#if data.tarea.definicion_ejecutiva == '' || data.tarea.definicion_ejecutiva == null}
              <p class="mt-6 text-sm text-gray-600 dark:text-gray-300 sm:text-md">
                En este momento no hay un resumen ejecutivo para esta tarea. ¿Deseas crear uno?
                <button onclick={createSummary} class="px-3 py-1 text-sm text-white rounded bg-sky-700 hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 {rotaSummary ? 'animate-ping' : 'animate-none'}">Crear uno</button>
              </p>
            {:else}
              <p class="p-4 mt-6 text-sm text-gray-900 bg-white rounded-md shadow-md dark:bg-slate-800 dark:text-gray-200 font-dosis sm:text-lg">{@html marked(data.tarea.definicion_ejecutiva ?? '')}</p>
            {/if}
            <div class="mt-6">
              <div class="flex flex-row justify-between pr-3 mb-2">
                <h2 class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 text-pretty">Información Obtenida</h2>
                <button onclick={update} class="flex items-center justify-center p-2 text-white rounded-full bg-sky-900 dark:bg-sky-700 hover:bg-sky-800 dark:hover:bg-sky-600"><RotateCcw class="w-6 h-6 {rotaDetailes ? 'animate-spin' : 'animate-none'}" /></button>
              </div>

              {#await data.respuestas}
                <p class="mt-6 text-gray-600 dark:text-gray-300 text-lg/8 sm:text-base">Cargando...</p>
              {:then respuestas}
                {#if respuestas}
                  <KpiRespuestas taskAnswers={respuestas} />
                {/if}
              {:catch error}
                <!-- promise was rejected -->
                <p class="text-red-500 dark:text-red-400">Something went wrong: {error.message}</p>
              {/await}
            </div>
          </div>
        </Tabs.Content>
        <Tabs.Content value="tarea" class="p-6">
          <!-- Contenido del tab Tarea -->
          <div class="mx-auto max-w-7xl lg:mx-0">
            <h2 class="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 text-pretty sm:text-xl">{data.tarea.title}</h2>
            <p class="mt-6 text-sm text-gray-600 dark:text-gray-300 sm:text-base">{@html mostrarCompleto ? data.tarea.description : truncarTexto(data.tarea.description, 200)}</p>
            <button
              class="text-blue-500 dark:text-blue-400 hover:underline"
              onclick={event => {
                event.preventDefault()
                mostrarCompleto = !mostrarCompleto
              }}>
              {mostrarCompleto ? 'Mostrar menos' : 'Mostrar más'}
            </button>
            <div class="mt-6">
              <h2 class="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 text-pretty sm:text-xl">Preguntas:</h2>
              {#await data.pasos}
                <div class="text-gray-600 dark:text-gray-300 text-lg/8 sm:text-base">Cargando...</div>
              {:then pasos}
                <div class="space-y-6">
                  {#each pasos as ans}
                    <div class="overflow-hidden bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-lg">
                      <div class="grid grid-cols-5 gap-4">
                        <div class="col-span-5 p-4">
                          <span class="text-sm text-gray-700 dark:text-gray-300">Numero: {ans.correlativeNumber + 1} de tipo {ans.type}</span>
                          <h2 class="mb-2 text-base font-normal text-gray-800 dark:text-gray-200">{@html ans.instruction[0].data || ''}</h2>
                          {#if ans.alternatives && ans.alternatives.length > 0}
                            <span class="text-sm text-gray-700 dark:text-gray-300">Alternativas:</span>
                            <ul class="mt-2 ml-5 text-gray-700 dark:text-gray-300 list-disc">
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
        </Tabs.Content>
        <Tabs.Content value="respuestas" class="p-6">
          {#await data.taskAnswers}
            <p class="mt-6 text-gray-600 dark:text-gray-300 text-lg/8 sm:text-base">Cargando...</p>
          {:then Trespuestas}
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Trespuestas?.length}
              {#if Trespuestas[0]?.stepAnswerDetails}
              
                {#each Trespuestas[0].stepAnswerDetails as r}
                  {#if r.tipo_paso == 'photo' && r.respuesta_cruda}
                    <button
                      type="button"
                      class="group overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-md h-auto cursor-pointer"
                      onclick={() => openModal(`https://imgtx.interno.snuuper.com/image/https://files.snuuper.com/${r.respuesta_cruda}?quality=50`)}
                      onkeydown={e => e.key === 'Enter' && openModal(`https://imgtx.interno.snuuper.com/image/https://files.snuuper.com/${r.respuesta_cruda}?width=1200`)}
                      aria-label="Ver imagen ampliada">
                      <div class="relative pb-[75%]">
                        <img src="https://imgtx.interno.snuuper.com/image/https://files.snuuper.com/{r.respuesta_cruda}?width=350" alt="Foto respuesta" class="absolute inset-0 w-full h-full object-contain transition-all duration-300 group-hover:scale-105" loading="lazy" />
                      </div>
                    </button>
                  {/if}
                {/each}
              {/if}
            </div>
          {/await}
        </Tabs.Content>
        <Tabs.Content value="manual" class="p-6">
          <!-- Contenido del tab Manual -->
          <div class="mx-auto max-w-7xl lg:mx-0">
            <h2 class="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 text-pretty sm:text-xl">Instrucciones al Sherpa IA</h2>
            <p class="mt-6 text-sm text-gray-600 dark:text-gray-300 sm:text-base">Instrucciones para el análisis de la Encuesta.</p>
            <div
              class="p-4 mt-6 text-sm text-gray-900 bg-white rounded-md shadow-md dark:bg-slate-900 dark:text-gray-200 opacity-90 font-dosis sm:text-lg"
             >
             {@html marked(data.tarea.manual_ai ?? '')}
          </div>
        </Tabs.Content>
        <Tabs.Content value="op" class="p-6">
          <!-- Contenido del tab Manual -->
          <div class="mx-auto max-w-7xl lg:mx-0">
            <h2 class="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 text-pretty sm:text-xl">Pasos de Proceso - Experimental</h2>
            <p class="mt-6 text-sm text-gray-600 dark:text-gray-300 sm:text-base">Pasos a relizar.</p>
            <div
              class="p-4 mt-6 text-sm text-gray-900 bg-white rounded-md shadow-md dark:bg-slate-900 dark:text-gray-200 opacity-90 font-dosis sm:text-lg"
             >
             <Button onclick={update}>Poblar Step Answer Details<Disc3 class="w-8 h-8 {rotaDetailes ? 'animate-spin' : 'animate-none'}"></Disc3></Button>
             <Button onclick={createSummary}>Crear Resumen <Disc3 class="w-8 h-8 {rotaSummary ? 'animate-spin' : 'animate-none'}"></Disc3></Button>
             <Button onclick={creaReporte}>Crear Reporte <Disc3 class="w-8 h-8 {rotaReport ? 'animate-spin' : 'animate-none'}"></Disc3></Button>
             <Button onclick={test}>Crear Embeddings <Disc3 class="w-8 h-8 {rotaTest ? 'animate-spin' : 'animate-none'}"></Disc3></Button>
             <Button onclick={createSherpa}>Crear Sherpa <Disc3 class="w-8 h-8 {rotaSherpa ? 'animate-spin' : 'animate-none'}"></Disc3></Button>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  </div>
</div>
{#if showModal}
  <div class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" transition:fade={{ duration: 200 }} onclick={closeModal} onkeydown={e => e.key === 'Escape' && closeModal()} role="dialog" aria-modal="true" tabindex="0">
    <div class="relative w-full h-full flex items-center justify-center">
      <!-- Botón de cerrar -->
      <button class="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-colors" onclick={closeModal} aria-label="Cerrar">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Imagen ampliada -->
      <div class="max-h-[90vh] max-w-[90vw]">
        <img src={selectedImage} alt="Imagen ampliada" class="h-full w-full object-contain" />
      </div>
    </div>
  </div>
{/if}

