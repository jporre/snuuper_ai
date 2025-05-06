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
	import 'dayjs/locale/es';
	import { onMount } from 'svelte';
	import { marked } from 'marked';

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
	let uniqueSubtypes = $state([]);
    let uniqueModes = $state([]);
    let uniqueCompanies = $state([]);

	function truncarTexto(texto: string, limite: number) {
		if (texto.length <= limite) return texto;
		return texto.slice(0, limite) + '...';
	}
	// Función para filtrar tareas
	$effect(() => {
		// Reset página cuando cambia el término de búsqueda
		if (searchTerm) currentPage = 1;
	});
	onMount(() => {
		
	//	extractUniqueFilters(tareas);
		
		
	});
	$effect(() =>{
		extractUniqueFilters(tareas);
	});
	async  function extractUniqueFilters(tareas) {
		const tt = await tareas;
		const subtypes = new Set();
		const modes = new Set();
		const companies = new Set();
		
		tt.forEach(tarea => {
			if (tarea.subtype) subtypes.add(tarea.subtype);
			if (tarea.mode) modes.add(tarea.mode);
			if (tarea.companyDetails[0]?.name) companies.add(tarea.companyDetails[0].name);
		});
		
		uniqueSubtypes = Array.from(subtypes);
		uniqueModes = Array.from(modes);
		uniqueCompanies = Array.from(companies);
	}
	
	function filterTareas(tareas) {
		if (!tareas) return [];
		const normalizeText = (text: string) =>
		text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
		const search = normalizeText(searchTerm);
		return tareas.filter(tarea => {
			const matchesSearchTerm = normalizeText(tarea.title).includes(search) ||
			normalizeText(tarea.description).includes(search);
			const matchesSubtype = selectedSubtype ? tarea.subtype === selectedSubtype : true;
			const matchesMode = selectedMode ? tarea.mode === selectedMode : true;
			const matchesCompany = selectedCompany ? tarea.companyDetails[0]?.name === selectedCompany : true;
			
			return matchesSearchTerm && matchesSubtype && matchesMode && matchesCompany;
		});
	}
	// Función para paginar resultados
	function getPaginatedTareas(tareas) {
		if (!tareas) return [];
		const filteredTareas = filterTareas(tareas);
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredTareas.slice(startIndex, startIndex + itemsPerPage);
	}
	function handleItemsPerPageChange(event) {
		itemsPerPage = parseInt(event.target.value);
		currentPage = 1; // Reset a primera página cuando cambia items por página
	}
		

</script>
<div class="min-w-full min-h-screen space-y-2 columns-1">
	{#await data.tareas}
			<div>Cargando las tareas...</div>
		{:then tareas}
	<div class="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-2 backdrop-blur">
		<form>
			<div class="relative drop-shadow-md shadow-blue-800">
				<Search class="text-muted-foreground absolute left-2 top-[50%] h-4 w-4 translate-y-[-50%]" />
				<Input placeholder="Filtrar el Listado de Tareas Activas" class="pl-8 rounded-xl" bind:value={searchTerm} />
				<BorderBeam size={250} duration={12} />
			</div>
			<div class="flex mt-2 space-x-2">
                <select bind:value={selectedSubtype} class="select select-bordered">
                    <option value="">Filtrar por Subtipo</option>
                    {#each uniqueSubtypes as subtype}
                        <option value={subtype}>{subtype}</option>
                    {/each}
                </select>
                <select bind:value={selectedMode} class="select select-bordered">
                    <option value="">Filtrar por Modo</option>
                    {#each uniqueModes as mode}
                        <option value={mode}>{mode}</option>
                    {/each}
                </select>
                <select bind:value={selectedCompany} class="select select-bordered">
                    <option value="">Filtrar por Compañía</option>
                    {#each uniqueCompanies as company}
                        <option value={company}>{company}</option>
                    {/each}
                </select>
            </div>
		</form>
	</div>
	<div class="grid min-w-full grid-cols-1 gap-1 p-1 md:grid-cols-2 lg:grid-cols-3">
		
			{#each getPaginatedTareas(tareas) as tarea, i}
				<div class="p-2 border border-blue-600 shadow-xl card hover:bg-slate-100">
					<div class="card-body">
						<div class="flex flex-row items-center justify-between pb-2 space-y-0 card-title font-poppins">
							<span class="text-lg">{tarea.title}</span>
							{#if tarea.companyDetails[0]?.name}
								<span class="px-3 py-1 text-sm text-white truncate badge bg-sky-900">{tarea.companyDetails[0]?.name}</span>
							{:else}
								<Building class="w-6 h-6 p-1 text-white rounded-full bg-sky-900" />
							{/if}
						</div>
						{#if tarea.definicion_ejecutiva}
							<p>{@html mostrarCompleto ? marked(tarea.definicion_ejecutiva) : truncarTexto(marked(tarea.definicion_ejecutiva), 200)}
								<Ellipsis onclick={() => (mostrarCompleto = !mostrarCompleto)} class="w-6 h-6 p-1 text-white rounded-full bg-sky-900" /></p>
							{:else}
							<p>{@html mostrarCompleto ? tarea.description : truncarTexto(tarea.description, 200)}
								<Ellipsis onclick={() => (mostrarCompleto = !mostrarCompleto)} class="w-6 h-6 p-1 text-white rounded-full bg-sky-900" />
							</p>
							{/if}
						
					</div>
					<div class="justify-between px-2 font-mono text-xs card-actions text-muted-foreground">
						<Time timestamp={tarea.createdAt} format="dddd @ h:mm A · MMMM D, YYYY"></Time>
						<a href="tareas/{tarea._id}">
							<CircleArrowOutUpRight class="w-6 h-6 p-1 text-white rounded-full bg-sky-900 hover:bg-green-200 hover:text-sky-900" />
						</a>
					</div>
				</div>
			{/each}
			<div class="grid md:col-span-2 lg:col-span-3">
				<!-- Paginación -->
				{#if filterTareas(tareas).length > 0}
					<div class="flex items-center justify-between px-4 py-3 mt-4 bg-white border-t border-gray-200 sm:px-6">
						<div class="flex flex-col items-center md:flex-row">
							<select class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={itemsPerPage} onchange={handleItemsPerPageChange}>
								<option value="6">6 por página</option>
								<option value="10">10 por página</option>
								<option value="20">20 por página</option>
								<option value="2000">Todos</option>
							</select>
							<span class="ml-4 text-sm text-gray-700">
								Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filterTareas(tareas).length)} a {Math.min(currentPage * itemsPerPage, filterTareas(tareas).length)} de {filterTareas(tareas).length} resultados
							</span>
						</div>
						<div class="flex flex-col space-x-2 md:flex-row">
							<button onclick={() => (currentPage = Math.max(currentPage - 1, 1))} disabled={currentPage === 1} class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"> Anterior </button>
							<button onclick={() => (currentPage = Math.min(currentPage + 1, Math.ceil(filterTareas(tareas).length / itemsPerPage)))} disabled={currentPage >= Math.ceil(filterTareas(tareas).length / itemsPerPage)} class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"> Siguiente </button>
						</div>
					</div>
				{/if}
			</div>
		</div>
		{:catch error}
			<p>{error.message}</p>
		{/await}
</div>
