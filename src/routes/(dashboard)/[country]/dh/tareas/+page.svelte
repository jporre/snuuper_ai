<script lang="ts">
    import type { PageData } from './$types';
    import BorderBeam from '$lib/components/BorderBeam.svelte';
    import { getUserState } from '$lib/state.svelte';
    import Search from 'lucide-svelte/icons/search';
    import Building from 'lucide-svelte/icons/building';
    import CircleArrowOutUpRight from 'lucide-svelte/icons/circle-arrow-out-up-right';
    import Ellipsis from 'lucide-svelte/icons/ellipsis';
    import Input from '$lib/components/ui/input/input.svelte';
    import Time, { dayjs } from 'svelte-time';
	import * as Card from "$lib/components/ui/card/index.js";
    //import 'dayjs/locale/es';
    import { onMount } from 'svelte';
    import { marked } from 'marked';
  import { ChevronLastIcon, ChevronRightCircle, ChevronRightCircleIcon } from 'lucide-svelte'
  import Button from '$lib/components/ui/button/button.svelte'

    dayjs.locale('es');
    let { data }: { data: PageData } = $props();
    let tareas = data.tareas;
    const user = getUserState();
    // Estados para búsqueda y paginación
    let searchTerm = $state('');
    let selectedSubtype = $state('');
    let selectedMode = $state('');
    let selectedCompany = $state('');
    let currentPage = $state(1);
    let itemsPerPage = $state(6);
    let mostrarCompleto = $state(false);
    let uniqueSubtypes = $state<string[]>([]);
    let uniqueModes = $state<string[]>([]);
    let uniqueCompanies = $state<string[]>([]);

    function truncarTexto(texto: string, limite: number) {
        if (texto.length <= limite) return texto;
        return texto.slice(0, limite) + '...';
    }
    // Función para filtrar tareas
    $effect(() => {
        // Reset página cuando cambia el término de búsqueda
        if (searchTerm || selectedSubtype || selectedMode || selectedCompany) currentPage = 1;
    });

    $effect(() =>{
        extractUniqueFilters(tareas);
    });

    async  function extractUniqueFilters(tareasPromise: Promise<PageData['tareas']>) {
        const resolvedTareas = await tareasPromise;
        if (!resolvedTareas) return;
        const subtypes = new Set<string>();
        const modes = new Set<string>();
        const companies = new Set<string>();
        
        resolvedTareas.forEach(tarea => {
            if (tarea.subtype) subtypes.add(tarea.subtype);
            if (tarea.mode) modes.add(tarea.mode);
            if (tarea.companyDetails && tarea.companyDetails[0]?.name) companies.add(tarea.companyDetails[0].name);
        });
        
        uniqueSubtypes = Array.from(subtypes);
        uniqueModes = Array.from(modes);
        uniqueCompanies = Array.from(companies);
    }
    
    function filterTareas(tareasToFilter: PageData['tareas']) {
        if (!tareasToFilter) return [];
        const normalizeText = (text: string | undefined | null): string =>
        (text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
        const search = normalizeText(searchTerm);
        return tareasToFilter.filter(tarea => {
            const matchesSearchTerm = normalizeText(tarea.title).includes(search) ||
            normalizeText(tarea.description).includes(search) ||
            normalizeText(tarea.definicion_ejecutiva).includes(search);
            const matchesSubtype = selectedSubtype ? tarea.subtype === selectedSubtype : true;
            const matchesMode = selectedMode ? tarea.mode === selectedMode : true;
            const matchesCompany = selectedCompany ? tarea.companyDetails && tarea.companyDetails[0]?.name === selectedCompany : true;
            
            return matchesSearchTerm && matchesSubtype && matchesMode && matchesCompany;
        });
    }
    // Función para paginar resultados
    function getPaginatedTareas(tareasToPaginate: PageData['tareas']) {
        if (!tareasToPaginate) return [];
        const filtered = filterTareas(tareasToPaginate);
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filtered.slice(startIndex, startIndex + itemsPerPage);
    }
    function handleItemsPerPageChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        itemsPerPage = parseInt(target.value);
        currentPage = 1; // Reset a primera página cuando cambia items por página
    }
        

</script>
<div class="min-w-full min-h-screen space-y-2 columns-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    {#await data.tareas}
            <div class="p-4 text-center">Cargando las tareas...</div>
        {:then tareasValue}
    <div class="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-2 backdrop-blur sticky top-0 z-10">
        <form>
            <div class="relative drop-shadow-md shadow-blue-800 dark:shadow-blue-500/50">
                <Search class="text-muted-foreground absolute left-2 top-[50%] h-4 w-4 translate-y-[-50%]" />
                <Input placeholder="Filtrar el Listado de Tareas Activas" class="pl-8 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600" bind:value={searchTerm} />
                <BorderBeam size={250} duration={12} />
            </div>
            <div class="flex flex-wrap mt-2 space-x-0 md:space-x-2 gap-2 md:gap-0">
                <select bind:value={selectedSubtype} class="select select-bordered w-full md:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                    <option value="">Filtrar por Subtipo</option>
                    {#each uniqueSubtypes as subtype}
                        <option value={subtype}>{subtype}</option>
                    {/each}
                </select>
                <select bind:value={selectedMode} class="select select-bordered w-full md:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                    <option value="">Filtrar por Modo</option>
                    {#each uniqueModes as mode}
                        <option value={mode}>{mode}</option>
                    {/each}
                </select>
                <select bind:value={selectedCompany} class="select select-bordered w-full md:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                    <option value="">Filtrar por Compañía</option>
                    {#each uniqueCompanies as company}
                        <option value={company}>{company}</option>
                    {/each}
                </select>
                <Button class="btn btn-primary" type="button" href="/{data.country}/dh/tareas/{searchTerm}">
                    Director a Tarea
                    <CircleArrowOutUpRight class="w-4 h-4 p-1 mx-2 text-white rounded-full bg-sky-900 dark:bg-sky-700 hover:bg-green-500 dark:hover:bg-green-600 hover:text-sky-900 dark:hover:text-white" />
                </Button>
            </div>
        </form>
    </div>
    <div class="grid min-w-full grid-cols-1 gap-2 p-1 md:grid-cols-2 lg:grid-cols-3">
        
            {#each getPaginatedTareas(tareasValue) as tarea, i}
				<Card.Root class="hover:bg-slate-100 dark:hover:bg-gray-700 border-1 rounded-xl shadow-xl bg-white dark:bg-gray-800 transition duration-300 ease-in-out">
					<Card.Header class="flex flex-row items-center justify-between">
						<Card.Title class="text-lg font-poppins text-gray-900 dark:text-gray-100">{tarea.title}</Card.Title>
						{#if tarea.companyDetails && tarea.companyDetails[0]?.name}
							<span class="px-3 py-1 text-sm text-white truncate badge bg-sky-900 dark:bg-sky-700">{tarea.companyDetails[0]?.name}</span>
						{:else}
							<Building class="w-6 h-6 p-1 text-white rounded-full bg-sky-900 dark:bg-sky-700" />
						{/if}
					</Card.Header>
					<Card.Content>
						<div class="text-sm text-gray-700 dark:text-gray-300 min-h-30">
							{#if tarea.definicion_ejecutiva}
								<p>{@html mostrarCompleto ? marked(tarea.definicion_ejecutiva) : truncarTexto(marked(tarea.definicion_ejecutiva), 200)}
									{#if marked(tarea.definicion_ejecutiva).length > 200}
										<Ellipsis onclick={() => (mostrarCompleto = !mostrarCompleto)} class="inline w-5 h-5 p-0.5 ml-1 text-white rounded-full cursor-pointer bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-400" />
									{/if}
								</p>
							{:else if tarea.description}
								<p>{@html mostrarCompleto ? marked(tarea.description) : truncarTexto(marked(tarea.description), 200)}
									{#if marked(tarea.description).length > 200}
										<Ellipsis onclick={() => (mostrarCompleto = !mostrarCompleto)} class="inline w-5 h-5 m-1 text-white rounded-full cursor-pointer bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-400" />
									{/if}
								</p>
							{/if}
						</div>
					</Card.Content>
					<Card.Footer class="flex  flex-row gap-2 justify-between items-center font-mono text-xs text-muted-foreground">
						<Time timestamp={tarea.createdAt} format="dddd @ h:mm A · MMMM D, YYYY"></Time>
						<a href="/{data.country}/dh/tareas/{tarea._id}" class="flex p-2 mx-2 hover:text-sky-900 dark:hover:text-white"> Ver Detalles
							<ChevronRightCircle class=" flex w-6 h-6 p-1 mx-2 text-white rounded-full bg-sky-900 dark:bg-sky-700 hover:bg-green-500 dark:hover:bg-green-600 hover:text-sky-900 dark:hover:text-white" />
						</a>
					</Card.Footer>
				</Card.Root>
            {/each}
            {#if getPaginatedTareas(tareasValue).length === 0}
                <div class="md:col-span-2 lg:col-span-3 p-4 text-center text-gray-500 dark:text-gray-400">
                    No hay tareas que coincidan con los filtros seleccionados.
                </div>
            {/if}
            <div class="grid md:col-span-2 lg:col-span-3">
                <!-- Paginación -->
                {#if filterTareas(tareasValue).length > itemsPerPage}
                    <div class="flex flex-col md:flex-row items-center justify-between px-4 py-3 mt-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                        <div class="flex flex-col items-center mb-2 md:mb-0 md:flex-row">
                            <select class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" value={itemsPerPage} onchange={handleItemsPerPageChange}>
                                <option value="6">6 por página</option>
                                <option value="10">10 por página</option>
                                <option value="20">20 por página</option>
                                <option value="2000">Todos</option>
                            </select>
                            <span class="mt-2 md:mt-0 md:ml-4 text-sm text-gray-700 dark:text-gray-300">
                                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filterTareas(tareasValue).length)} a {Math.min(currentPage * itemsPerPage, filterTareas(tareasValue).length)} de {filterTareas(tareasValue).length} resultados
                            </span>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick={() => (currentPage = Math.max(currentPage - 1, 1))} disabled={currentPage === 1} class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"> Anterior </button>
                            <button onclick={() => (currentPage = Math.min(currentPage + 1, Math.ceil(filterTareas(tareasValue).length / itemsPerPage)))} disabled={currentPage >= Math.ceil(filterTareas(tareasValue).length / itemsPerPage)} class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"> Siguiente </button>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
        {:catch error}
            <p class="text-red-600 dark:text-red-400 p-4">Error al cargar tareas: {error.message}</p>
        {/await}
</div>
