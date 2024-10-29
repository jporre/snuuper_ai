<script lang="ts">
	import type { PageData } from './$types';
	import BorderBeam from '$lib/components/BorderBeam.svelte';
	import { getUserState } from '$lib/state.svelte';
	let { data }: { data: PageData } = $props();
	const user = getUserState();
</script>

<section>
	<div class="relative flex flex-col items-start justify-between w-1/5 p-3 mb-3 border shadow-md rounded-3xl border-gray-700/70 bg-background">
		{user.nombre}
		<BorderBeam size={150} duration={12} />
	</div>
	
	<div class="grid grid-cols-5 gap-4">
		<div class="col-span-3">
			<ul role="list" class="divide-y divide-gray-100">
				
				<li class="z-50 flex items-center justify-between px-2 py-5 bg-gray-300 rounded-lg gap-x-6 hover:bg-gray-400 ">
					<div class="min-w-0">
						<div class="flex items-start gap-x-3">
							<p class="text-sm font-semibold leading-6 text-gray-900">GraphQL API</p>
							<p class="mt-0.5 whitespace-nowrap rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Complete</p>
						</div>
						<div class="flex items-center mt-1 text-xs leading-5 text-gray-500 gap-x-2">
							<p class="whitespace-nowrap">
								Due on <time datetime="2023-03-17T00:00Z">March 17, 2023</time>
							</p>
							<svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
								<circle cx="1" cy="1" r="1" />
							</svg>
							<p class="truncate">Created by Leslie Alexander</p>
						</div>
					</div>
					<div class="flex items-center flex-none gap-x-4">
						<a href="/" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block">View project<span class="sr-only">, GraphQL API</span></a>
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
				<li class="flex items-center justify-between px-2 py-5 bg-gray-300 rounded-lg gap-x-6 hover:bg-gray-400">
					<div class="min-w-0">
						<div class="flex items-start gap-x-3">
							<p class="text-sm font-semibold leading-6 text-gray-900">GraphQL API</p>
							<p class="mt-0.5 whitespace-nowrap rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Complete</p>
						</div>
						<div class="flex items-center mt-1 text-xs leading-5 text-gray-500 gap-x-2">
							<p class="whitespace-nowrap">
								Due on <time datetime="2023-03-17T00:00Z">March 17, 2023</time>
							</p>
							<svg viewBox="0 0 2 2" class="h-0.5 w-0.5 fill-current">
								<circle cx="1" cy="1" r="1" />
							</svg>
							<p class="truncate">Created by Leslie Alexander</p>
						</div>
					</div>
					<div class="flex items-center flex-none gap-x-4">
						<a href="/" class="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block">View project<span class="sr-only">, GraphQL API</span></a>
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
			</ul>
		</div>
	</div>
</section>
