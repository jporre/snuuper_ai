<script lang="ts">
	import type { PageData } from './$types';
	import BorderBeam from '$lib/components/BorderBeam.svelte';
	import { getUserState } from '$lib/state.svelte';
	import Search from 'lucide-svelte/icons/search';
	import Building from 'lucide-svelte/icons/building';
	import CircleArrowOutUpRight from 'lucide-svelte/icons/circle-arrow-out-up-right';
	import Input from '$lib/components/ui/input/input.svelte';
	import Time, { dayjs } from 'svelte-time';
	import 'dayjs/locale/es';
	dayjs.locale('es');
	let { data }: { data: PageData } = $props();
	const user = getUserState();
	// Estados para búsqueda y paginación
	let searchTerm = $state('');
	let currentPage = $state(1);
	let itemsPerPage = $state(6);
	let mostrarCompleto = $state(false);
	function truncarTexto(texto: string, limite: number) {
		if (texto.length <= limite) return texto;
		return texto.slice(0, limite) + '...';
	}
	// Función para filtrar tareas
	$effect(() => {
		// Reset página cuando cambia el término de búsqueda
		if (searchTerm) currentPage = 1;
	});
	function filterTareas(tareas) {
		if (!tareas) return [];
		const normalizeText = (text: string) =>
			text
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.toLowerCase();
		const search = normalizeText(searchTerm);
		return tareas.filter((tarea) => normalizeText(tarea.title).includes(search) || normalizeText(tarea.description).includes(search) || normalizeText(tarea.status).includes(search));
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
	<div class="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-2 backdrop-blur">
		<form>
			<div class="relative drop-shadow-md shadow-blue-800">
				<Search class="text-muted-foreground absolute left-2 top-[50%] h-4 w-4 translate-y-[-50%]" />
				<Input placeholder="Filtrar el Listado de Tareas Activas" class="pl-8 rounded-xl" bind:value={searchTerm} />
				<BorderBeam size={250} duration={12} />
			</div>
		</form>
	</div>
	<div class="grid min-w-full grid-cols-1 gap-1 p-1 md:grid-cols-2 lg:grid-cols-3">
		{#await data.tareas}
			<div>Cargando las tareas...</div>
		{:then tareas}
			{#each getPaginatedTareas(tareas) as tarea, i}
				<div class="card shadow-xl border border-blue-600 hover:bg-slate-100 p-2">
					<div class="card-body">
						<div class="card-title flex flex-row items-center justify-between pb-2 space-y-0 font-poppins">
							<span class="text-lg">{tarea.title}</span>
							{#if tarea.companyDetails[0]?.name}
								<span class="badge bg-sky-900 px-3 text-white truncate text-sm py-1">{tarea.companyDetails[0]?.name}</span>
							{:else}
								<Building class="w-6 h-6 text-white bg-sky-900 rounded-full p-1" />
							{/if}
						</div>
						<p>{@html mostrarCompleto ? tarea.description : truncarTexto(tarea.description, 200)}</p>
					</div>
					<div class="card-actions justify-between font-mono text-xs text-muted-foreground px-2">
						<Time timestamp={tarea.createdAt} format="dddd @ h:mm A · MMMM D, YYYY"></Time>
						<a href="/dh/tareas/{tarea._id}">
							<CircleArrowOutUpRight class="w-6 h-6 p-1 text-white bg-sky-900 rounded-full hover:bg-green-200 hover:text-sky-900" />
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
		{:catch error}
			<p>{error.message}</p>
		{/await}
	</div>
</div>
