<script lang="ts">
	import type { LayoutData } from './$types';
	import LogoSnuuperPequeño from '$lib/images/logosnuuper.png?enhanced';
	import IlustracionSnuuper1 from '$lib/images/ilustracionsnupper1.webp?enhanced';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { Snippet, onMount, afterUpdate } from 'svelte';
	import { marked } from 'marked';
	import * as m from '$lib/paraglide/messages.js';
	let MobileMenu = $state(false);
	let { children, data }: { children: Snippet; data: LayoutData } = $props();
	type ConversationType = { who: string; msg: string }[];
	import Chasing from '$lib/spinners/Chasing.svelte';
	import { setUserState } from '$lib/state.svelte';
	const user = setUserState(data.userData);

	let searchText = $state('');
	let Conversation: ConversationType = $state([]);
	let chatDisplay = $state(false);
	let ShowLoader = $state(false);

	async function handleSearch() {
		chatDisplay = true;
		ShowLoader = true;
		let addToConversation = { who: 'user', msg: searchText };
		Conversation = [...Conversation, addToConversation];
		const res = await fetch('./chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ mensaje: searchText })
		});

		const data = await res.json();
		addToConversation = { who: 'ai', msg: data.text };
		Conversation = [...Conversation, addToConversation];
		searchText = '';
		scrollToBottom();
		ShowLoader = false;
	}
	let chatContainer: HTMLDivElement;
	// Function to scroll to bottom
	function scrollToBottom() {
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}
	// Scroll to bottom after each update
	// afterUpdate(() => {
	//     scrollToBottom();
	// });
</script>

<svelte:head>
	<title>Zona de Información</title>
</svelte:head>
<div class="">
	<div class="realtive md:fixed md:inset-y-0 md:min-h-screen lg:z-50 lg:flex lg:w-52 md:w-16 lg:flex-col">
		<!-- Sidebar component, swap this element with another sidebar if you like -->
		<div class="absolute top-0 flex flex-col min-h-full px-6 pb-4 overflow-y-auto bg-gray-900 md:w-full transition transform ease-in-out {MobileMenu ? 'translate-x-0 w-full' : '-translate-x-96'} md:translate-x-0 md:px-4 grow gap-y-5">
			<div class="flex items-center h-16 md:h-8 lg:h-16 md:mt-3">
				<enhanced:img class="w-8 h-8" src={LogoSnuuperPequeño} alt="Your Company"> </enhanced:img>
			</div>
			<nav class="flex flex-col flex-1">
				<ul role="list" class="flex flex-col flex-1 gap-y-7">
					<li>
						<ul role="list" class="-mx-2 space-y-1">
							<li>
								<!-- Current: "bg-gray-800 text-white", Default: "text-gray-400 hover:text-white hover:bg-gray-800" -->
								<a href="/" class="flex p-2 text-sm font-semibold leading-6 text-white bg-gray-800 rounded-md group gap-x-3">
									<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
										<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
									</svg>
									<span class="md:hidden lg:inline"> Home</span>
								</a>
							</li>
						</ul>
					</li>
				</ul>
			</nav>
		</div>
	</div>
	<div class="lg:pl-52 md:pl-16" id="buscador y perfil">
		<div class="sticky top-0 z-40 flex items-center h-16 px-4 bg-white border-b border-gray-200 shadow-sm shrink-0 gap-x-4 sm:gap-x-6 sm:px-6 lg:px-8">
			<button
				type="button"
				class="-m-2.5 p-2.5 text-gray-700 md:hidden"
				onclick={() => {
					MobileMenu = !MobileMenu;
				}}
			>
				<span class="sr-only">Open sidebar</span>
				<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
				</svg>
			</button>
			<!-- Separator -->
			<div class="w-px h-6 bg-gray-900/10 lg:hidden" aria-hidden="true"></div>

			<div class="flex self-stretch flex-1 gap-x-4 lg:gap-x-6">
				<div class="relative flex flex-1">
					<label for="search-field" class="sr-only">Busca Información</label>
					<svg class="absolute inset-y-0 w-5 h-full text-gray-400 pointer-events-none left-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
						<path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
					</svg>
					<input id="search-field" class="block w-full h-full py-0 pl-8 pr-0 text-gray-900 border-0 rounded-xl placeholder:text-gray-400 focus:ring-1 sm:text-sm" placeholder="Buscar..." type="search" name="search" autocomplete="off" bind:value={searchText} onchange={handleSearch} />
				</div>
				<div class="flex items-center gap-x-4 lg:gap-x-6">
					<button type="button" class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
						<span class="sr-only">View notifications</span>
						<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
							<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
						</svg>
					</button>

					<!-- Separator -->
					<div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true"></div>

					<!-- Profile dropdown -->
					<div class="relative">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger class="w-fit">
								<div class="flex items-center gap-x-4">
									<img class="w-8 h-8 rounded-full bg-gray-50" src={user.foto} alt="foto del usuario" />
									<span class="hidden lg:flex lg:items-center">
										<span class="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">{user.nombre || ''}</span>
										<svg class="w-5 h-5 ml-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
											<path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
										</svg>
									</span>
								</div></DropdownMenu.Trigger
							>
							<DropdownMenu.Content>
								<DropdownMenu.Group>
									<DropdownMenu.Label>Mis datos</DropdownMenu.Label>
									<DropdownMenu.Separator />
									<DropdownMenu.Item>Perfil</DropdownMenu.Item>
									<DropdownMenu.Item><a href="./logout">Salir</a></DropdownMenu.Item>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</div>
			</div>
		</div>
		<!-- Chat -->
		<div class="{chatDisplay ? 'z-10' : 'z-0'} relative " aria-labelledby="modal-title" role="dialog" aria-modal="true">
			<div class="{chatDisplay ? 'bg-opacity-75' : 'bg-opacity-0'} fixed inset-0 bg-gray-500 transition-opacity duration-300 ease-in lg:pl-52 md:pl-16" aria-hidden="true"></div>
			<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
				<div class="flex items-start justify-center min-h-full p-4 mt-16 text-center sm:p-0 lg:pl-52 md:pl-16">
					<div class="{chatDisplay ? 'ease-out opacity-100 translate-y-0 sm:scale-100' : 'ease-in opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'} relative transform duration-500 overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl sm:translate-y-0 sm:p-6">
						<!-- Close button -->
						<div class="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
							<button
								type="button"
								onclick={() => {
									chatDisplay = !chatDisplay;
								}}
								class="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
							>
								<span class="sr-only">Cerrar</span>
								<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div class="flex">
							<div class="w-full mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
								<h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Chat</h3>
								<!-- Chat container with fixed height and auto-scroll -->
								<div bind:this={chatContainer} class="h-[75vh] mt-2 overflow-y-auto custom-scrollbar">
									<ul role="list" class="flex flex-col space-y-6">
										{#each Conversation as item}
											{#if item.who == 'user'}
												<li class="relative flex flex-row max-w-full float-end gap-x-4">
													<img src={user.foto} alt="imagen del usuario" class="relative flex-none w-6 h-6 mt-3 rounded-full bg-gray-50" />
													<div class="flex-auto p-3 rounded-md ring-1 ring-inset ring-gray-200">
														<div class="flex justify-between gap-x-4">
															<div class="py-0.5 text-xs leading-5 text-gray-500">
																<span class="font-medium text-gray-900">{user.nombre}</span>
															</div>
															<time datetime="2023-01-23T15:56" class="flex-none py-0.5 text-xs leading-5 text-gray-500"></time>
														</div>
														<p class="text-sm leading-6 text-gray-500">{item.msg}</p>
													</div>
												</li>
											{:else}
												<li class="relative flex flex-row-reverse max-w-full float-end gap-x-4">
													<enhanced:img src={LogoSnuuperPequeño} alt="Logo Snuuper" class="relative flex-none w-6 h-6 mt-3 rounded-full bg-gray-50" />
													<div class="flex-auto p-3 rounded-md ring-1 ring-inset ring-gray-200">
														<div class="flex justify-between gap-x-4">
															<div class="py-0.5 text-xs leading-5 text-gray-500">
																<span class="font-medium text-gray-900">Snuuper</span>
															</div>
															<time datetime="2023-01-23T15:56" class="flex-none py-0.5 text-xs leading-5 text-gray-500"></time>
														</div>
														<p class="text-sm leading-6 text-gray-500">{@html marked(item.msg)}</p>
													</div>
												</li>
											{/if}
										{/each}
									</ul>
									<div class="mt-5 {ShowLoader ? '' : 'hidden'}">
										<Chasing size="50" color="blue" duration="1s" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- en chat -->
		<div class="absolute z-0 w-full min-h-screen py-3 grow bg-slate-50">
			<div class="relative z-10 px-4 sm:px-6 lg:px-2">
				{@render children()}
			</div>
			<div class="absolute top-0 z-0 flex flex-col w-screen h-screen"><enhanced:img src={IlustracionSnuuper1} class="object-cover object-center w-full min-h-screen grow opacity-15" alt="fondo-ilustrado"></enhanced:img></div>
		</div>
	</div>
</div>

<style>
	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 transparent;
	}

	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: #cbd5e1;
		border-radius: 3px;
	}
</style>
