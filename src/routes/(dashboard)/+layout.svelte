<script lang="ts">
  import LogoSnuuperPequeno from '$lib/images/logosnuuper.png?enhanced'
  import Escena_vertical from '$lib/images/Snuuper_Escena_Central.png'
  import Chasing from '$lib/spinners/Chasing.svelte'
  import DefaultAvatar from '$lib/images/PinMapaSnuuperAzul.png'
  import { marked } from 'marked'
  import { SSE } from 'sse.js'
  import { page } from '$app/stores'
  import type { Snippet } from 'svelte'
  import type { LayoutData } from './$types'
  type ConversationType = { role: string; content: string }[]
  import { setUserState } from '$lib/state.svelte'
  import { Cl, Mx, Pe, Ar } from 'svelte-flags'
  import { invalidateAll, onNavigate } from '$app/navigation'
  import { fade, fly } from 'svelte/transition'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
  let { data, children }: { data: LayoutData; children: Snippet } = $props()
  const user = setUserState(data.userData)
  let MobileMenu = $state(false)
  let userPhoto = $state('https://files.snuuper.com/' + user.picture)
  let searchText = $state('')
  let Conversation: ConversationType = $state([])
  let chatDisplay = $state(false)
  let ShowLoader = $state(false)
  let scrollToDiv: HTMLDivElement
  let query = $state('')
  let answer = $state('')
  let userD = data.userData
  let country = data.country
  onNavigate(navigation => {
    if (document.startViewTransition) {
      return new Promise(resolve => {
        document.startViewTransition &&
          document.startViewTransition(async () => {
            resolve()
            await navigation.complete
          })
      })
    }
  })
  if (user.picture == '') {
    userPhoto = DefaultAvatar
  }
  if (user.picture.startsWith('https')) {
    userPhoto = user.picture
  }
  const handleSearch = async () => {
    chatDisplay = true
    ShowLoader = true
    let addToConversation = { role: 'user', content: searchText }
    Conversation = [...Conversation, addToConversation]
    let origen = $page.url.pathname
    const eventSource = new SSE('/openai', { headers: { 'Content-Type': 'application/json' }, payload: JSON.stringify({ Conversation, origen: origen, country: country }) })
    query = ''
    Conversation = [...Conversation, { role: 'assistant', content: '' }]
    eventSource.addEventListener('error', handleError)
    eventSource.addEventListener('message', e => {
      scrollToBottom()
      try {
        ShowLoader = false
        const data = JSON.parse(e.data)
        if (data.choices[0].finish_reason === 'stop') {
          answer = ''
          return
        }
        const { content } = data.choices[0].delta
        answer = (answer ?? '') + content
        Conversation[Conversation.length - 1].content = answer
      } catch (err) {
        handleError(err)
      }
    })
    eventSource.stream()
    scrollToBottom()
    searchText = ''
  }
  function handleError<T>(err: T) {
    ShowLoader = false
    query = ''
    answer = ''
    console.error(err)
  }
  function scrollToBottom() {
    setTimeout(function () {
      scrollToDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
    }, 100)
  }
  async function changeCountry(newCountry: string) {
    ShowLoader = true
    Conversation = []
    searchText = ''
    query = ''
    answer = ''
    const url = new URL(window.location.href)
    url.pathname = `/${newCountry}/dh/tareas` //url.pathname.replace(country, newCountry);
    window.location.href = url.toString()
    await invalidateAll()
    ShowLoader = false
  }
</script>

<svelte:head>
  <title>Zona de Cliente</title>
</svelte:head>
<div class="max-w-screen" data-theme="emerald">
  <div class="z-40 md:fixed md:inset-y-0 md:min-h-screen lg:z-50 lg:flex lg:w-52 md:w-16 lg:flex-col">
    <div class="absolute top-0 flex flex-col min-h-full px-6 pb-4 overflow-y-auto bg-gray-900 md:w-full transition transform ease-in-out {MobileMenu ? 'translate-x-0 w-full' : '-translate-x-96'} md:translate-x-0 md:px-4 gap-y-5">
      <div class="flex items-center h-16 md:h-8 lg:h-16 md:mt-3">
        <enhanced:img class="w-8 h-8" src={LogoSnuuperPequeno} alt="Snuuper"></enhanced:img>
      </div>
      <nav class="flex flex-col flex-1 bg-top bg-no-repeat bg-cover bg-blend-multiply" style="background-image: url({Escena_vertical}); background-color: rgba(1, 1, 1, 0.8); background-blend-mode: overlay;">
        <ul role="list" class="flex flex-col flex-1 gap-y-7">
          <li>
            <ul role="list" class="-mx-2 space-y-1">
              <li>
                <!-- Current: "bg-gray-800 text-white", Default: "text-gray-400 hover:text-white hover:bg-gray-800" -->
                <a href="/{country}/dh/tareas" class="flex p-2 text-sm font-semibold leading-6 text-white bg-gray-800 rounded-md group gap-x-3">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  <span class="md:hidden lg:inline">Home</span>
                </a>
                <a href="/{country}/duplicados" class="flex p-2 text-sm font-semibold leading-6 text-white bg-gray-800 rounded-md group gap-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                  </svg>
                  <span class="md:hidden lg:inline">Duplicados</span>
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
          MobileMenu = !MobileMenu
        }}>
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
          <input
            id="search-field"
            class="block w-full h-full py-0 pl-8 pr-0 text-gray-900 border-0 rounded-xl placeholder:text-gray-400 focus:ring-1 sm:text-sm"
            placeholder="Escribe aquí para conversar con tus datos !"
            type="search"
            name="search"
            autocomplete="off"
            bind:value={searchText}
            onchange={handleSearch} />
        </div>
        <div class="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            onclick={() => {
              chatDisplay = !chatDisplay
            }}>
            <span class="sr-only">View notifications</span>
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </button>
          <!-- Separator -->
          <div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true"></div>
          <!-- Profile dropdown -->
          <div class="flex justify-end flex-1 px-2 gap-1">
            <div class="flex w-18">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  {#if country === 'CL'}<Cl />{/if}
                  {#if country === 'MX'}<Mx />{/if}
                  {#if country === 'PE'}<Pe />{/if}
                  {#if country === 'AR'}<Ar />{/if}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Group>
                    <DropdownMenu.GroupHeading>Selecciona Pais</DropdownMenu.GroupHeading>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item onclick={() => changeCountry('CL')}><Cl /> Chile</DropdownMenu.Item>
                    <DropdownMenu.Item onclick={() => changeCountry('MX')}><Mx /> Mexico</DropdownMenu.Item>
                    <DropdownMenu.Item onclick={() => changeCountry('PE')}><Pe /> Peru</DropdownMenu.Item>
                    <DropdownMenu.Item onclick={() => changeCountry('AR')}><Ar /> Argentina</DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
            <div class="flex">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                 
                    <img class="h-8 w-8 object-cover" alt="Foto del Usuario" src={userPhoto} />
                 
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Group>
                    <DropdownMenu.GroupHeading>Mi Cuenta</DropdownMenu.GroupHeading>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item>Profile</DropdownMenu.Item>
                    <DropdownMenu.Item>Billing</DropdownMenu.Item>
                    <DropdownMenu.Item>Team</DropdownMenu.Item>
                    <DropdownMenu.Item><a href="/logout">Salir</a></DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Chat -->
  <div class="{chatDisplay ? 'z-10' : 'z-0 hidden'} relative" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="{chatDisplay ? 'bg-opacity-75 h-full' : 'bg-opacity-0 hidden'} fixed inset-0 bg-gray-500 transition-opacity duration-300 ease-in lg:pl-52 md:pl-16" aria-hidden="true"></div>
    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div class="flex items-start justify-center p-4 mt-16 text-center sm:p-0 lg:pl-52 md:pl-16">
        <div
          class="{chatDisplay
            ? 'ease-out opacity-100 translate-y-0 sm:scale-100'
            : 'ease-in opacity-0 max-h-0 translate-y-4 sm:translate-y-0 sm:scale-95'} relative transform duration-500 overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-7xl sm:translate-y-0 sm:p-6">
          <!-- Close button -->
          <div class="absolute top-0 right-0 pt-4 pr-4 sm:block">
            <button
              type="button"
              onclick={() => {
                chatDisplay = !chatDisplay
              }}
              class="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
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
              <div class="h-[75vh] mt-2 overflow-y-auto custom-scrollbar">
                <ul role="list" class="flex flex-col space-y-6">
                  {#each Conversation as item}
                    {#if item.role == 'user'}
                      <li class="relative flex flex-row max-w-full float-end gap-x-4">
                        <img src={userPhoto} alt="imagen del usuario" class="relative flex-none w-6 h-6 mt-3 rounded-full bg-gray-50" />
                        <div class="flex-auto p-3 rounded-md ring-1 ring-inset ring-gray-200">
                          <div class="flex justify-between gap-x-4">
                            <div class="py-0.5 text-xs leading-5 text-gray-500">
                              <span class="font-medium text-gray-900">{user.firstname}</span>
                            </div>
                            <time datetime="2023-01-23T15:56" class="flex-none py-0.5 text-xs leading-5 text-gray-500"></time>
                          </div>
                          <p class="text-sm leading-6 text-gray-500">{item.content}</p>
                        </div>
                      </li>
                    {/if}
                    {#if item.role == 'assistant' && item.content != ''}
                      <li class="relative flex flex-row max-w-full float-end gap-x-4">
                        <div class="flex-auto p-3 rounded-md ring-1 ring-inset ring-gray-200">
                          <div class="flex justify-between gap-x-4">
                            <div class="py-0.5 text-xs leading-5 text-gray-500">
                              <span class="font-medium text-gray-900">Snuuper</span>
                            </div>
                            <time datetime="2023-01-23T15:56" class="flex-none py-0.5 text-xs leading-5 text-gray-500"></time>
                          </div>
                          <p class="text-sm leading-6 text-gray-500">{@html marked(item.content)}</p>
                        </div>
                        <enhanced:img src={LogoSnuuperPequeno} alt="Logo Snuuper" class="relative flex-none w-6 h-6 mt-3 rounded-full bg-gray-50" />
                      </li>
                    {/if}
                  {/each}
                </ul>
                <div class="mt-5 {ShowLoader ? '' : 'hidden'}">
                  <Chasing size="50" color="blue" duration="1s" />
                </div>
                <div class="" bind:this={scrollToDiv}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- en chat -->
<div class="z-20 min-h-screen py-3 lg:pl-52 md:pl-16 bg-slate-50">
  <div class="z-40 min-h-full px-4 sm:px-6 lg:px-2" id="contenedor-de-tarea">
    {@render children?.()}
  </div>
  <!-- div class="absolute top-0 z-0 flex flex-col w-screen h-screen"><enhanced:img src={IlustracionSnuuper1} class="object-cover object-center w-full min-h-screen grow opacity-15" alt="fondo-ilustrado"></enhanced:img></!-->
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
  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }
  @keyframes slide-from-right {
    from {
      transform: translateX(100%) scale(1.15);
      box-shadow: var(--shadow-elevation-high);
    }
  }
  :contenedor-de-tarea::view-transition-old(root) {
    animation: 500ms ease-out both fade-out;
  }
</style>
