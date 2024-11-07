<script lang="ts">
	import type { PageData } from './$types';
	import BorderBeam from '$lib/components/BorderBeam.svelte';
	import { getUserState } from '$lib/state.svelte';
	
	let { data }: { data: PageData } = $props();
	const user = getUserState();
	
	// Estados para búsqueda y paginación
	let searchTerm = $state('');
	let currentPage = $state(1);
	let itemsPerPage = $state(5);
	
	// Función para filtrar tareas
	$effect(() => {
		// Reset página cuando cambia el término de búsqueda
		if (searchTerm) currentPage = 1;
	});
	
	function filterTareas(tareas) {
		if (!tareas) return [];
		return tareas.filter(tarea => 
			tarea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			tarea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			tarea.status.toLowerCase().includes(searchTerm.toLowerCase())
		);
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

<div>
	<div class="relative z-0 flex flex-col items-start justify-between w-2/5 p-3 mb-3 border shadow-md opacity-90 rounded-3xl border-gray-700/70">
		{user.firstname}
		<BorderBeam size={150} duration={12} />
	</div>

	<!-- Barra de búsqueda -->
	<div class="mb-4">
		<div class="relative">
			<input
				type="text"
				class="w-full px-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				placeholder="Buscar tareas..."
				bind:value={searchTerm}
			/>
			<svg 
				class="absolute w-5 h-5 text-gray-400 right-3 top-2.5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path 
					fill-rule="evenodd"
					d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
	</div>
	
	<div class="grid grid-cols-5 gap-4">
		<div class="col-span-5">
			<ul role="list" class="divide-y divide-gray-100">
				{#await data.tareas}
					<div>Cargando las tareas...</div>
				{:then tareas}
					{#each getPaginatedTareas(tareas) as tarea, i}
						<li class="z-50 flex items-center justify-between px-2 py-5 bg-gray-300 rounded-lg gap-x-6 hover:bg-gray-400">
							<div class="min-w-0">
								<div class="flex flex-col items-start gap-x-3">
									<p class="text-sm font-semibold leading-6 text-gray-900">{tarea.title}</p>
									<p class="text-sm font-semibold leading-6 text-gray-700">{@html tarea.description}</p>
									<p class="mt-0.5 whitespace-nowrap rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{tarea.status}</p>
								</div>
								<div class="flex items-center mt-1 text-xs leading-5 text-gray-500 gap-x-2">
									<p class="whitespace-nowrap">
										Creada <time datetime="2023-03-17T00:00Z">{tarea.createdAt}</time>
									</p>
									<svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
										<circle cx="1" cy="1" r="1" />
									</svg>
									<p class="truncate">{tarea.companyDetails[0]?.name}</p>
								</div>
							</div>
							<div class="flex items-center flex-none gap-x-4">
								<a href="/dh/tareas/{tarea._id}" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block">
									Ver Tarea<span class="sr-only">, GraphQL API</span>
								</a>
								<div class="relative flex-none">
									<button type="button" class="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900" id="options-menu-0-button" aria-expanded="false" aria-haspopup="true">
										<span class="sr-only">Open options</span>
										<svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
											<path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
										</svg>
									</button>
								</div>
							</div>
						</li>
					{/each}
					
					<!-- Paginación -->
					{#if filterTareas(tareas).length > 0}
						<div class="flex items-center justify-between px-4 py-3 mt-4 bg-white border-t border-gray-200 sm:px-6">
							<div class="flex items-center">
								<select
									class="px-3 py-2 text-sm border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
									value={itemsPerPage}
									onchange={handleItemsPerPageChange}
								>
									<option value="5">5 por página</option>
									<option value="10">10 por página</option>
									<option value="20">20 por página</option>
								</select>
								<span class="ml-4 text-sm text-gray-700">
									Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filterTareas(tareas).length)} a {Math.min(currentPage * itemsPerPage, filterTareas(tareas).length)} de {filterTareas(tareas).length} resultados
								</span>
							</div>
							<div class="flex space-x-2">
								<button
									onclick={() => currentPage = Math.max(currentPage - 1, 1)}
									disabled={currentPage === 1}
									class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
								>
									Anterior
								</button>
								<button
									onclick={() => currentPage = Math.min(currentPage + 1, Math.ceil(filterTareas(tareas).length / itemsPerPage))}
									disabled={currentPage >= Math.ceil(filterTareas(tareas).length / itemsPerPage)}
									class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
								>
									Siguiente
								</button>
							</div>
						</div>
					{/if}
				{:catch error}
					<p>{error.message}</p>
				{/await}
			</ul>
		</div>
	</div>
</div>