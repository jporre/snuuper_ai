<script lang="ts">
  import GridPattern from '$lib/components/GridPattern.svelte';
  import LogoManager from "$lib/images/managerlogo.png?enhanced";
	import { onMount } from 'svelte';

   onMount(() => {

   });
</script>

<div class="z-0 flex flex-col mx-auto bg-blue-100">
  <GridPattern />
<div class="z-10 py-4 mx-auto bg-white shadow-md sm:py-12 max-w-7xl">
    <div class="max-w-2xl px-6 mx-auto bg-white lg:max-w-7xl lg:px-8">
        <div class="flex min-w-full m-2 md:float-right md:min-w-10">
            <enhanced:img class="object-cover object-center " src={LogoManager} alt="Manager Logo">
          </div>
      <h2 class="py-2 mt-4 font-semibold text-blue-900 text-normal sm:text-xl">Sitio Interno</h2>
      <p class="max-w-lg mt-2 text-xl font-medium tracking-tight sm:text-3xl text-pretty text-gray-950 md:text-5xl">Aplicaciones Internas, Investigación y Desarrollo.</p>
      <a href="./dh/tareas" class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        ver mas
        <svg class="-mr-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
          <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" />
        </svg></a>
      
      <div class="grid grid-cols-1 gap-4 mt-10 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
        <div class="relative lg:col-span-3">
          <div class="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]"></div>
          <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)] lg:rounded-tl-[calc(2rem+1px)]">
            <img class="object-cover object-left h-80" src="https://tailwindui.com/plus/img/component-images/bento-01-performance.png" alt="">
            <div class="p-10 pt-4">
              <h3 class="font-semibold text-blue-800 text-sm/4">Performance</h3>
              <p class="mt-2 font-medium tracking-tight text-lg/7 text-gray-950">Lightning-fast builds</p>
              <p class="max-w-lg mt-2 text-gray-600 text-sm/6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In gravida justo et nulla efficitur, maximus egestas sem pellentesque.</p>
            </div>
          </div>
          <div class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]"></div>
        </div>
        <div class="relative lg:col-span-3">
          <div class="absolute inset-px rounded-lg bg-white lg:rounded-tr-[2rem]"></div>
          <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-tr-[calc(2rem+1px)]">
            <img class="object-cover object-left h-80 lg:object-right" src="https://supabase.4c.cl/storage/v1/object/public/publico/LogoBnex_LetrasIndigo950.png?t=2024-10-22T14%3A19%3A33.780Z" alt="">
            <div class="p-10 pt-4">
              <h3 class="font-semibold text-blue-800 text-sm/4">Releases</h3>
              <p class="mt-2 font-medium tracking-tight text-lg/7 text-gray-950">Push to deploy</p>
              <p class="max-w-lg mt-2 text-gray-600 text-sm/6">Curabitur auctor, ex quis auctor venenatis, eros arcu rhoncus massa, laoreet dapibus ex elit vitae odio.</p>
            </div>
          </div>
          <div class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-tr-[2rem]"></div>
        </div>
        <div class="relative lg:col-span-2">
          <div class="absolute inset-px rounded-lg bg-white lg:rounded-bl-[2rem]"></div>
          <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-bl-[calc(2rem+1px)]">
            <img class="object-cover object-left h-80" src="https://tailwindui.com/plus/img/component-images/bento-01-speed.png" alt="">
            <div class="p-10 pt-4">
              <h3 class="font-semibold text-blue-800 text-sm/4">Speed</h3>
              <p class="mt-2 font-medium tracking-tight text-lg/7 text-gray-950">Built for power users</p>
              <p class="max-w-lg mt-2 text-gray-600 text-sm/6">Sed congue eros non finibus molestie. Vestibulum euismod augue.</p>
            </div>
          </div>
          <div class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-bl-[2rem]"></div>
        </div>
        <div class="relative lg:col-span-2">
          <div class="absolute bg-white rounded-lg inset-px"></div>
          <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
            <img class="object-cover object-center h-80" src="https://tailwindui.com/plus/img/component-images/bento-01-integrations.png" alt="">
            <div class="p-10 pt-4">
              <h3 class="font-semibold text-blue-800 text-sm/4">Integrations</h3>
              <p class="mt-2 font-medium tracking-tight text-lg/7 text-gray-950">Connect your favorite tools</p>
              <p class="max-w-lg mt-2 text-gray-600 text-sm/6">Maecenas at augue sed elit dictum vulputate, in nisi aliquam maximus arcu.</p>
            </div>
          </div>
          <div class="absolute rounded-lg shadow pointer-events-none inset-px ring-1 ring-black/5"></div>
        </div>
        <div class="relative lg:col-span-2">
          <div class="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]"></div>
          <div class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-br-[calc(2rem+1px)]">
            <img class="object-cover object-center h-80" src="https://tailwindui.com/plus/img/component-images/bento-01-network.png" alt="">
            <div class="p-10 pt-4">
              <h3 class="font-semibold text-blue-800 text-sm/4">Network</h3>
              <p class="mt-2 font-medium tracking-tight text-lg/7 text-gray-950">Globally distributed CDN</p>
              <p class="max-w-lg mt-2 text-gray-600 text-sm/6">Aenean vulputate justo commodo auctor vehicula in malesuada semper.</p>
            </div>
          </div>
          <div class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]"></div>
        </div>
      </div>
    </div>
  </div>
  </div>

  
